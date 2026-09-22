import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import Flight from "../models/Flight.js";
import generatePNR from "../utils/generatePNR.js";

// Note  Create a booking for the logged-in user
// Route POST /api/bookings
export const createBooking = asyncHandler(async (req, res) => {
  const { flightId, travelClass, passengers, contactEmail, contactPhone } = req.body;

  if (!flightId || !travelClass || !passengers?.length || !contactEmail || !contactPhone) {
    res.status(400);
    throw new Error("Missing required booking details");
  }

  const flight = await Flight.findById(flightId);
  if (!flight) {
    res.status(404);
    throw new Error("Flight not found");
  }

  const fare = flight.fares.find((f) => f.class === travelClass);
  if (!fare) {
    res.status(400);
    throw new Error(`No ${travelClass} fare available on this flight`);
  }

  if (fare.seatsAvailable < passengers.length) {
    res.status(400);
    throw new Error(`Only ${fare.seatsAvailable} seat(s) left in ${travelClass}`);
  }

  const totalAmount = fare.price * passengers.length;

  // Generate a PNR that isn't already in use
  let pnr = generatePNR();
  while (await Booking.findOne({ pnr })) pnr = generatePNR();

  const booking = await Booking.create({
    user: req.user._id,
    flight: flightId,
    travelClass,
    passengers,
    contactEmail,
    contactPhone,
    totalAmount,
    pnr,
  });

  fare.seatsAvailable -= passengers.length;
  await flight.save();

  const populated = await booking.populate("flight");
  res.status(201).json(populated);
});

// Note  Get all bookings for the logged-in user
// Route GET /api/bookings/mine
export const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate("flight")
    .sort({ createdAt: -1 });
  res.json(bookings);
});

// Note  Get a single booking by id (owner or admin only)
// Route GET /api/bookings/:id
export const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate("flight");
  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }
  if (booking.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to view this booking");
  }
  res.json(booking);
});

// Note  Cancel a booking (owner only) - restores seat availability
// Route PUT /api/bookings/:id/cancel
export const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }
  if (booking.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to cancel this booking");
  }
  if (booking.status === "CANCELLED") {
    res.status(400);
    throw new Error("Booking is already cancelled");
  }

  booking.status = "CANCELLED";
  await booking.save();

  await Flight.updateOne(
    { _id: booking.flight, "fares.class": booking.travelClass },
    { $inc: { "fares.$.seatsAvailable": booking.passengers.length } }
  );

  res.json(booking);
});
