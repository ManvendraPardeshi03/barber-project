const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    barberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Barber",
      required: true
    },
    services: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
        required: true
      }
    ],
    startTime: {
      type: Date,
      required: true
    },
    endTime: {
      type: Date,
      required: true
    },
    totalDuration: {
      type: Number, // minutes
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending"
    }
  },
  { timestamps: true }
);

/*
 Indexing for faster slot queries
*/
appointmentSchema.index({ barberId: 1, startTime: 1, endTime: 1 });

module.exports = mongoose.model("Appointment", appointmentSchema);
