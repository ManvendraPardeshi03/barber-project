const Appointment = require("../models/Appointment");
const Service = require("../models/Service");
const BarberLeave = require("../models/BarberLeave");

const SHOP_START = 10 * 60; // 10:00
const SHOP_END = 20 * 60;   // 20:00

// ------------------ SLOT GENERATOR ------------------
function generate30MinSlots(date) {
  const slots = [];

  for (let mins = SHOP_START; mins < SHOP_END; mins += 30) {
    const start = new Date(`${date}T00:00:00`);
    const hours = Math.floor(mins / 60);
const minutes = mins % 60;
start.setHours(hours, minutes, 0, 0);
    const end = new Date(start.getTime() + 30 * 60000);

    const format = (d) =>
      d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });

    slots.push({
      label: `${format(start)} - ${format(end)}`,
      startTime: start,
      endTime: end,
    });
  }

  return slots;
}

// ------------------ GET AVAILABLE SLOTS ------------------
const getAvailableSlots = async (req, res) => {
  try {
    const { barberId, date, totalTime = 30 } = req.query;
    if (!barberId || !date) return res.status(400).json({ message: "Missing params" });

    const allSlots = generate30MinSlots(date);

    // Fetch confirmed appointments
    const bookedAppointments = await Appointment.find({
      barberId,
      startTime: { $lt: new Date(`${date}T20:00:00`) },
      endTime: { $gt: new Date(`${date}T10:00:00`) },
      status: "confirmed",
      informed: false 
    });

    // Convert DB appointments to Date objects
    const normalizedBooked = bookedAppointments.map(app => ({
      startTime: new Date(app.startTime),
      endTime: new Date(app.endTime),
    }));

    // Fetch all leaves for the date
    const leaves = await BarberLeave.find({ barberId, date });

    const now = new Date();

    const slotsWithStatus = allSlots.map((slot) => {
      const slotStart = slot.startTime;
      const slotEnd = new Date(slotStart.getTime() + 30 * 60000); // dynamic slot end
      const shopClose = new Date(slotStart);
      shopClose.setHours(20, 0, 0, 0);

      let available = true;
      let reason = "";

      // ------------------ Check Leaves ------------------
      for (let l of leaves) {
        if (l.type === "FULL_DAY") {
          available = false;
          reason = "Barber unavailable";
          break;
        } else if (l.type === "PARTIAL") {
          const leaveStart = new Date(`${l.date}T${l.startTime}`);
          const leaveEnd = new Date(`${l.date}T${l.endTime}`);
          if (slotStart < leaveEnd && slotEnd > leaveStart) {
            available = false;
            reason = "Barber unavailable";
            break;
          }
        }
      }

      // ------------------ Check Booked Appointments ------------------
      if (available) {
        available = !normalizedBooked.some(app => slotStart < app.endTime && slotEnd > app.startTime);
        if (!available) reason = "Booked";
      }

      // ------------------ Check Shop Close ------------------
      if (available && slotEnd > shopClose) {
        available = false;
        reason = "Exceeds closing time";
      }

      // ------------------ Check Past Time ------------------
      if (available && slotStart < now) {
        available = false;
        reason = "Time passed";
      }

      return { ...slot, available, reason };
    });

    res.json({ slots: slotsWithStatus });
  } catch (err) {
    console.error("Slot error:", err);
    res.status(500).json({ message: "Slot fetch failed" });
  }
};

function roundUpToNextSlot(date, slotMinutes = 30) {
  const ms = slotMinutes * 60 * 1000;
  return new Date(Math.ceil(date.getTime() / ms) * ms);
}


// ------------------ BOOK APPOINTMENT ------------------
const bookAppointment = async (req, res) => {
  try {
    const { barberId, services, startTime, name, phone } = req.body;
    if (!barberId || !services || !startTime || !name || !phone)
      return res.status(400).json({ message: "Missing booking info" });

    const serviceDocs = await Service.find({ _id: { $in: services } });
    const totalDuration = serviceDocs.reduce((s, x) => s + x.duration, 0);

    const start = new Date(startTime);
    const rawEnd = new Date(start.getTime() + totalDuration * 60000);
    const end = roundUpToNextSlot(rawEnd, 30);
    

    const bookingDate = start.toISOString().split("T")[0];

    const leaves = await BarberLeave.find({ barberId, date: bookingDate });

    const isBlockedByLeave = leaves.some((l) => {
      if (l.type === "FULL_DAY") return true;
      if (l.type === "PARTIAL") {
        const leaveStart = new Date(`${l.date}T${l.startTime}`);
        const leaveEnd = new Date(`${l.date}T${l.endTime}`);
        return start < leaveEnd && end > leaveStart;
      }
      return false;
    });

    if (isBlockedByLeave) return res.status(403).json({ message: "Barber unavailable" });

    const conflict = await Appointment.findOne({
      barberId,
      startTime: { $lt: end },
      endTime: { $gt: start },
      status: "confirmed",
      informed: { $ne: true },
    });

    if (conflict) return res.status(409).json({ message: "Slot already booked" });

    const appointment = await Appointment.create({
      barberId,
      services,
      startTime: start,
      endTime: end,
      totalDuration,
      customerName: name,
      customerPhone: phone,
      status: "confirmed",
    });

    res.status(201).json({ message: "Appointment booked", appointment });
  } catch (err) {
    console.error("Booking error:", err);
    res.status(500).json({ message: "Booking failed" });
  }
};

// ------------------ GET MY APPOINTMENTS ------------------
const getMyAppointments = async (req, res) => {
  try {
    // Fetch all appointments for this barber, and populate services
    const appointments = await Appointment.find({ barberId: req.user._id, status: "completed"   })
      .populate("services") // important: gives price, name etc
      .sort({ startTime: -1 });

    // Calculate revenue today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const revenueToday = appointments
      .filter(a => {
        const start = new Date(a.startTime);
        return start >= today && start < tomorrow;
      })
      .reduce((sum, a) => {
        return sum + (a.services?.reduce((s, svc) => s + (svc.price || 0), 0) || 0);
      }, 0);

    // Calculate total upcoming revenue
    const revenueUpcoming = appointments
      .reduce((sum, a) => {
        return sum + (a.services?.reduce((s, svc) => s + (svc.price || 0), 0) || 0);
      }, 0);

    // Send everything
    res.json({
      appointments,
      revenueToday,
      revenueUpcoming,
      totalAppointments: appointments.length
    });
  } catch (err) {
    console.error("Fetch appointments error:", err);
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
};


// ------------------ EXPORT ------------------
module.exports = { getAvailableSlots, bookAppointment, getMyAppointments };
