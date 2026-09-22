import express from "express";
import {
  searchFlights,
  getFlightById,
  listAirports,
  createFlight,
  updateFlight,
  deleteFlight,
} from "../controllers/flightController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.get("/", searchFlights);
router.get("/airports/all", listAirports);
router.get("/:id", getFlightById);
router.post("/", protect, adminOnly, createFlight);
router.put("/:id", protect, adminOnly, updateFlight);
router.delete("/:id", protect, adminOnly, deleteFlight);

export default router;
