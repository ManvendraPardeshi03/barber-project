const mongoose = require("mongoose");

const barberLeaveSchema = new mongoose.Schema(
  {
    barberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: { type: String, required: true }, // YYYY-MM-DD
    type: { type: String, enum: ["FULL_DAY", "PARTIAL"], default: "FULL_DAY" },
    startTime: { type: String }, // only for PARTIAL leave
    endTime: { type: String },   // only for PARTIAL leave
  },
  { timestamps: true }
);

barberLeaveSchema.index({ barberId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("BarberLeave", barberLeaveSchema);
