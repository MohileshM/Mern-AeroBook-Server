import asyncHandler from "express-async-handler";
import Booking from "../models/Booking.js";
import Flight from "../models/Flight.js";
import User from "../models/User.js";
import { ensureRollingWindow } from "../services/flightScheduler.js";

// Note  Manually trigger a rolling-window top-up check (the server also does this
//        automatically on boot and daily - this is just for on-demand testing)
// Route POST /api/admin/flights/generate
export const triggerFlightGeneration = asyncHandler(async (req, res) => {
  const result = await ensureRollingWindow();
  res.json({ message: "Rolling window check complete", ...result });
});

// Note  High-level counts for the admin dashboard header cards
// Route GET /api/admin/stats/summary
export const getSummary = asyncHandler(async (req, res) => {
  const [totalUsers, totalFlights, totalBookings, revenueAgg] = await Promise.all([
    User.countDocuments(),
    Flight.countDocuments(),
    Booking.countDocuments({ status: "CONFIRMED" }),
    Booking.aggregate([
      { $match: { status: "CONFIRMED" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]),
  ]);

  res.json({
    totalUsers,
    totalFlights,
    totalBookings,
    totalRevenue: revenueAgg[0]?.total || 0,
  });
});

// Note  Bookings & revenue grouped by day, for the last N days (line/bar chart)
// Route GET /api/admin/stats/bookings-over-time?days=14
export const getBookingsOverTime = asyncHandler(async (req, res) => {
  const days = Number(req.query.days) || 14;
  const since = new Date();
  since.setDate(since.getDate() - days);

  const data = await Booking.aggregate([
    { $match: { createdAt: { $gte: since }, status: "CONFIRMED" } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        bookings: { $sum: 1 },
        revenue: { $sum: "$totalAmount" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json(data.map((d) => ({ date: d._id, bookings: d.bookings, revenue: d.revenue })));
});

// Note  Bookings grouped by airline (pie/bar chart)
// Route GET /api/admin/stats/bookings-by-airline
export const getBookingsByAirline = asyncHandler(async (req, res) => {
  const data = await Booking.aggregate([
    { $match: { status: "CONFIRMED" } },
    {
      $lookup: {
        from: "flights",
        localField: "flight",
        foreignField: "_id",
        as: "flightInfo",
      },
    },
    { $unwind: "$flightInfo" },
    {
      $group: {
        _id: "$flightInfo.airline",
        bookings: { $sum: 1 },
        revenue: { $sum: "$totalAmount" },
      },
    },
    { $sort: { bookings: -1 } },
  ]);

  res.json(data.map((d) => ({ airline: d._id, bookings: d.bookings, revenue: d.revenue })));
});

// Note  Most popular routes by booking count (bar chart)
// Route GET /api/admin/stats/popular-routes
export const getPopularRoutes = asyncHandler(async (req, res) => {
  const data = await Booking.aggregate([
    { $match: { status: "CONFIRMED" } },
    {
      $lookup: {
        from: "flights",
        localField: "flight",
        foreignField: "_id",
        as: "flightInfo",
      },
    },
    { $unwind: "$flightInfo" },
    {
      $group: {
        _id: {
          origin: "$flightInfo.origin.city",
          destination: "$flightInfo.destination.city",
        },
        bookings: { $sum: 1 },
      },
    },
    { $sort: { bookings: -1 } },
    { $limit: 8 },
  ]);

  res.json(
    data.map((d) => ({
      route: `${d._id.origin} to ${d._id.destination}`,
      bookings: d.bookings,
    }))
  );
});
