import mongoose from "mongoose";

// One document per calendar date (YYYY-MM-DD) that already has generated flights.
// Lets the rolling-window scheduler check "have I filled this day yet?" with a single indexed lookup
// instead of scanning the Flight collection.
const generatedFlightDateSchema = new mongoose.Schema(
  {
    date: { type: String, required: true, unique: true }, // "YYYY-MM-DD"
  },
  { timestamps: true }
);

const GeneratedFlightDate = mongoose.model("GeneratedFlightDate", generatedFlightDateSchema);
export default GeneratedFlightDate;
