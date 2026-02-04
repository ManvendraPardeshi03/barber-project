// models/Appointment.js
const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
      customerName: { type: String, required: true }, // <-- check required
  customerPhone: { type: String, required: true },
    barberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    services: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
    ],
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    totalDuration: { type: Number, required: true },
    status: { type: String, enum: ["pending", "confirmed", "completed", "cancelled"], default: "pending" },
    informed: { type: Boolean, default: false }, // ✅ NEW
  },
  { timestamps: true }
);

appointmentSchema.index({ barberId: 1, startTime: 1, endTime: 1 });

module.exports = mongoose.model("Appointment", appointmentSchema);
