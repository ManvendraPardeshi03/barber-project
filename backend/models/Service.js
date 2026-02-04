const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  duration: { type: Number, required: true },
  price: { type: Number, required: true },
  image: { type: String }, // NEW field: optional URL
  active: { type: Boolean, default: true } // NEW: track active/inactive
}, { timestamps: true });

module.exports = mongoose.model("Service", serviceSchema);
