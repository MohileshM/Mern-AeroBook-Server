import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Flight from "../models/Flight.js";
import Booking from "../models/Booking.js";
import GeneratedFlightDate from "../models/GeneratedFlightDate.js";
import { ensureRollingWindow } from "../services/flightScheduler.js";

dotenv.config();

const seed = async () => {
  await connectDB();

  const destroy = process.argv.includes("--destroy");
  await Promise.all([Flight.deleteMany(), Booking.deleteMany(), User.deleteMany(), GeneratedFlightDate.deleteMany()]);
  console.log("Cleared existing flights, bookings, users and the generated-dates ledger.");

  if (destroy) {
    console.log("Destroy flag set - database left empty.");
    return mongoose.connection.close();
  }

  // Demo accounts
  await User.create({
    name: "Admin",
    email: "admin@flightbooking.in",
    password: "admin123",
    role: "admin",
  });
  await User.create({
    name: "Demo Traveller",
    email: "demo@flightbooking.in",
    password: "demo1234",
    role: "user",
  });
  console.log("Created admin@flightbooking.in / admin123 and demo@flightbooking.in / demo1234");

  // Fill the initial rolling window (same function the running server calls every day to
  // keep itself topped up - see services/flightScheduler.js). This is a one-time bootstrap;
  // once the server is running, it never needs to be re-run.
  const { totalGenerated } = await ensureRollingWindow();
  console.log(`Seeded ${totalGenerated} flights for the initial rolling window.`);

  await mongoose.connection.close();
  console.log("Seeding complete. The running server will keep the flight window topped up on its own from here.");
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
