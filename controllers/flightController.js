import asyncHandler from "express-async-handler";
import Flight from "../models/Flight.js";

// Note  Search flights by origin, destination and date (all optional filters)
// Route GET /api/flights?origin=DEL&destination=BOM&date=2026-10-12&travelClass=Economy
export const searchFlights = asyncHandler(async (req, res) => {
  const { origin, destination, date, travelClass, sort } = req.query;
  const query = {};

  if (origin) query["origin.code"] = origin.toUpperCase();
  if (destination) query["destination.code"] = destination.toUpperCase();

  if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    query.departureTime = { $gte: start, $lte: end };
  }

  if (travelClass) {
    query["fares.class"] = travelClass;
  }

  let flights = await Flight.find(query).lean();

  // Attach the lowest fare for the requested class (or overall lowest) for easy sorting/display
  flights = flights.map((f) => {
    const relevantFares = travelClass ? f.fares.filter((fare) => fare.class === travelClass) : f.fares;
    const cheapest = relevantFares.reduce(
      (min, fare) => (fare.price < min ? fare.price : min),
      relevantFares[0]?.price ?? Infinity
    );
    return { ...f, displayPrice: cheapest };
  });

  if (sort === "price") flights.sort((a, b) => a.displayPrice - b.displayPrice);
  if (sort === "duration") flights.sort((a, b) => a.durationMinutes - b.durationMinutes);
  if (sort === "departure") flights.sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime));

  res.json(flights);
});

// Note  Get a single flight by id
// Route GET /api/flights/:id
export const getFlightById = asyncHandler(async (req, res) => {
  const flight = await Flight.findById(req.params.id);
  if (!flight) {
    res.status(404);
    throw new Error("Flight not found");
  }
  res.json(flight);
});

// Note  List all distinct airports available in the system (for search dropdowns)
// Route GET /api/flights/airports/all
export const listAirports = asyncHandler(async (req, res) => {
  const origins = await Flight.distinct("origin");
  const destinations = await Flight.distinct("destination");
  const map = new Map();
  [...origins, ...destinations].forEach((a) => map.set(a.code, a));
  res.json(Array.from(map.values()).sort((a, b) => a.city.localeCompare(b.city)));
});

// Note  Create a flight (admin)
// Route POST /api/flights
export const createFlight = asyncHandler(async (req, res) => {
  const flight = await Flight.create(req.body);
  res.status(201).json(flight);
});

// Note  Update a flight (admin)
// Route PUT /api/flights/:id
export const updateFlight = asyncHandler(async (req, res) => {
  const flight = await Flight.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!flight) {
    res.status(404);
    throw new Error("Flight not found");
  }
  res.json(flight);
});

// Note  Delete a flight (admin)
// Route DELETE /api/flights/:id
export const deleteFlight = asyncHandler(async (req, res) => {
  const flight = await Flight.findByIdAndDelete(req.params.id);
  if (!flight) {
    res.status(404);
    throw new Error("Flight not found");
  }
  res.json({ message: "Flight removed" });
});
