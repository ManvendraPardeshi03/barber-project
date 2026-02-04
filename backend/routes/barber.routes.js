const express = require("express");
const router = express.Router();
const { protect, barberOnly } = require("../middleware/authMiddleware");
const Appointment = require("../models/Appointment");
const Service = require("../models/Service");
const BarberLeave = require("../models/BarberLeave");
const { getLeaves, addLeave, deleteLeave } = require("../controllers/barberLeave.controller");

// ---------------- DASHBOARD ----------------
router.get("/dashboard", protect, barberOnly, async (req, res) => {
  try {
    const barberId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all appointments
    const appointments = await Appointment.find({ barberId }).populate("services").sort({ startTime: 1 });

    // Get all leaves
    const leaves = await BarberLeave.find({ barberId }).sort({ date: 1 });

    // Upcoming appointments excluding informed leave-day appointments
    const upcomingAppointments = appointments
  .filter(a => {
    // ❌ NEVER show informed appointments
    if (a.informed === true) return false;

    // ❌ NEVER show completed appointments
    if (a.status === "completed") return false;

    // ❌ Only future appointments
    return new Date(a.startTime) > new Date();
  })
  .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
  .slice(0, 5);

    // Today appointments
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const todayAppointments = appointments.filter(a => a.startTime >= today && a.startTime < tomorrow);

    const onLeaveToday = leaves.some(l => new Date(l.date).toDateString() === today.toDateString());
    const servicesCount = await Service.countDocuments({ barberId });

    res.json({
      appointments: {
        total: appointments.length,
        today: todayAppointments.length,
        upcoming: upcomingAppointments,
      },
      leaves: {
        total: leaves.length,
        onLeaveToday,
        allLeaves: leaves,
      },
      services: {
        total: servicesCount,
      },
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Dashboard fetch failed" });
  }
});


// ---------------- BARBER APPOINTMENTS ----------------
router.get("/appointments", protect, barberOnly, async (req, res) => {
  const appointments = await Appointment.find({ barberId: req.user._id })
    .populate("services")
    .sort({ startTime: 1 });
  res.json(appointments);
});

// ---------------- UPDATE SERVICE ----------------
router.put("/services/:id", protect, barberOnly, async (req, res) => {
  const service = await Service.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(service);
});

// ---------------- MARK APPOINTMENT AS INFORMED ----------------
router.put("/appointments/:id/inform", protect, barberOnly, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment)
      return res.status(404).json({ message: "Appointment not found" });

    appointment.informed = true;
    await appointment.save();

    res.json({
      message: "Customer informed successfully",
      appointment,
    });
  } catch (err) {
    console.error("Inform error:", err);
    res.status(500).json({ message: "Failed to mark informed" });
  }
});

// ---------------- UPDATE APPOINTMENT STATUS ----------------
router.put("/appointments/:id/status", protect, barberOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    appointment.status = status;
    await appointment.save();

    res.json({ message: "Status updated", appointment });
  } catch (err) {
    console.error("Failed to update appointment status", err);
    res.status(500).json({ message: "Internal server error" });
  }
});



// ---------------- BARBER LEAVES ----------------
router.get("/leaves", protect, barberOnly, getLeaves);
router.post("/leaves", protect, barberOnly, addLeave);
router.delete("/leaves/:id", protect, barberOnly, deleteLeave);

module.exports = router;
