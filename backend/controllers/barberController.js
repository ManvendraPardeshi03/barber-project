const Barber = require("../models/Barber");

exports.createBarber = async (req, res) => {
  const barber = await Barber.create(req.body);
  res.status(201).json(barber);
};

exports.getBarbers = async (req, res) => {
  const barbers = await Barber.find().populate("userId", "name email");
  res.json(barbers);
};
