import express from "express";
import {
  getSummary,
  getBookingsOverTime,
  getBookingsByAirline,
  getPopularRoutes,
  triggerFlightGeneration,
} from "../controllers/adminController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.use(protect, adminOnly);
router.get("/stats/summary", getSummary);
router.get("/stats/bookings-over-time", getBookingsOverTime);
router.get("/stats/bookings-by-airline", getBookingsByAirline);
router.get("/stats/popular-routes", getPopularRoutes);
router.post("/flights/generate", triggerFlightGeneration);

export default router;
