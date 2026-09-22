import mongoose from "mongoose";

const airportSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, uppercase: true, trim: true }, // e.g. DEL
    city: { type: String, required: true, trim: true }, // e.g. Delhi
    name: { type: String, required: true, trim: true }, // e.g. Indira Gandhi International Airport
  },
  { _id: false }
);

const fareClassSchema = new mongoose.Schema(
  {
    class: { type: String, enum: ["Economy", "Premium Economy", "Business"], required: true },
    price: { type: Number, required: true, min: 0 }, // in INR
    seatsAvailable: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const flightSchema = new mongoose.Schema(
  {
    flightNumber: { type: String, required: true, trim: true }, // e.g. 6E-2031
    airline: { type: String, required: true, trim: true }, // e.g. IndiGo
    origin: { type: airportSchema, required: true },
    destination: { type: airportSchema, required: true },
    departureTime: { type: Date, required: true },
    arrivalTime: { type: Date, required: true },
    durationMinutes: { type: Number, required: true },
    stops: { type: Number, default: 0 },
    fares: { type: [fareClassSchema], required: true },
    aircraft: { type: String, trim: true },
  },
  { timestamps: true }
);

flightSchema.index({ "origin.code": 1, "destination.code": 1, departureTime: 1 });

const Flight = mongoose.model("Flight", flightSchema);
export default Flight;
