const Service = require("../models/Service");

exports.createService = async (req, res) => {
  const service = await Service.create(req.body);
  res.status(201).json(service);
};

exports.getServices = async (req, res) => {
  const services = await Service.find();
  res.json(services);
};
