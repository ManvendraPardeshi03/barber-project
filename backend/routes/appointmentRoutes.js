const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentController");
const { protect, barberOnly } = require("../middleware/authMiddleware");

// GET available slots
router.get("/available-slots", appointmentController.getAvailableSlots);

// GET all appointments
// router.get("/", appointmentController.getMyAppointments);
router.get("/", protect, barberOnly, appointmentController.getMyAppointments);

// POST booking
router.post("/book-public", appointmentController.bookAppointment);

module.exports = router; // ✅ correct
