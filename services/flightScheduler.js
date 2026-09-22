import cron from "node-cron";
import Flight from "../models/Flight.js";
import GeneratedFlightDate from "../models/GeneratedFlightDate.js";
import { buildFlightsForDate } from "../seed/flightGenerator.js";

const WINDOW_DAYS = Number(process.env.ROLLING_WINDOW_DAYS) || 30;

const toDateKey = (date) => date.toISOString().split("T")[0]; // "YYYY-MM-DD"

const startOfDay = (offsetDays) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  d.setHours(0, 0, 0, 0);
  return d;
};

// Generates flights for one calendar date if it hasn't been generated yet.
// Safe to call repeatedly - a unique index on GeneratedFlightDate.date prevents duplicates
// even if two server instances race on the same day.
const ensureDateIsGenerated = async (dateOnly) => {
  const key = toDateKey(dateOnly);
  const alreadyDone = await GeneratedFlightDate.findOne({ date: key });
  if (alreadyDone) return { key, generated: 0 };

  try {
    const flights = buildFlightsForDate(dateOnly);
    await Flight.insertMany(flights);
    await GeneratedFlightDate.create({ date: key });
    return { key, generated: flights.length };
  } catch (err) {
    // Most likely a duplicate-key race with another instance generating the same day - harmless
    if (err.code === 11000) return { key, generated: 0 };
    throw err;
  }
};

// Tops up the rolling window: makes sure every day from tomorrow through
// (today + WINDOW_DAYS) has flights. Call this on every server boot and once a day after that -
// it's cheap and a no-op for days that are already filled.
export const ensureRollingWindow = async () => {
  let totalGenerated = 0;
  const daysFilled = [];

  for (let offset = 1; offset <= WINDOW_DAYS; offset++) {
    const { key, generated } = await ensureDateIsGenerated(startOfDay(offset));
    if (generated > 0) {
      totalGenerated += generated;
      daysFilled.push(key);
    }
  }

  if (totalGenerated > 0) {
    console.log(
      `Flight scheduler: generated ${totalGenerated} flights across ${daysFilled.length} day(s) (${daysFilled[0]} to ${
        daysFilled[daysFilled.length - 1]
      }).`
    );
  } else {
    console.log(`Flight scheduler: rolling ${WINDOW_DAYS}-day window already up to date.`);
  }

  return { totalGenerated, daysFilled };
};

// Starts the background schedule. Runs an immediate catch-up (covers Render free-tier
// cold starts, where the process may have been asleep for days) and then re-checks daily.
export const startFlightScheduler = () => {
  ensureRollingWindow().catch((err) => console.error("Flight scheduler catch-up failed:", err));

  // Every day at 03:00 server time, extend the window by whatever new day has rolled into range.
  cron.schedule("0 3 * * *", () => {
    ensureRollingWindow().catch((err) => console.error("Flight scheduler daily run failed:", err));
  });
};
