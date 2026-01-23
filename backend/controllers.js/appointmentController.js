const Appointment = require("../models/Appointment");
const Service = require("../models/Service");

exports.bookAppointment = async (req, res) => {
  const { barberId, services, startTime } = req.body;

  const serviceDocs = await Service.find({ _id: { $in: services } });
  const totalDuration = serviceDocs.reduce(
    (sum, s) => sum + s.duration,
    0
  );

  const start = new Date(startTime);
  const end = new Date(start.getTime() + totalDuration * 60000);

  const conflict = await Appointment.findOne({
    barberId,
    startTime: { $lt: end },
    endTime: { $gt: start }
  });

  if (conflict)
    return res.status(409).json({ message: "Slot not available" });

  const appointment = await Appointment.create({
    userId: req.user._id,
    barberId,
    services,
    startTime: start,
    endTime: end,
    totalDuration,
    status: "confirmed"
  });

  res.status(201).json(appointment);
};
