import mongoose from "mongoose";

const passengerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 1, max: 120 },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    seat: { type: String, trim: true },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    flight: { type: mongoose.Schema.Types.ObjectId, ref: "Flight", required: true },
    travelClass: { type: String, enum: ["Economy", "Premium Economy", "Business"], required: true },
    passengers: { type: [passengerSchema], required: true, validate: (v) => v.length > 0 },
    contactEmail: { type: String, required: true, trim: true },
    contactPhone: { type: String, required: true, trim: true },
    totalAmount: { type: Number, required: true, min: 0 }, // INR
    pnr: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["CONFIRMED", "CANCELLED"],
      default: "CONFIRMED",
    },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
