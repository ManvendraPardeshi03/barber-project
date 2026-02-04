const Service = require("../models/Service");

// CREATE SERVICE
exports.createService = async (req, res) => {
  try {
    const { name, duration, price, image, active } = req.body;  
    const service = await Service.create({ name, duration, price, image, active });
    res.status(201).json(service);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create service" });
  }
};


// UPDATE SERVICE
exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, duration, price, image, active } = req.body;  // include active
    const service = await Service.findByIdAndUpdate(
      id,
      { name, duration, price, image, active },
      { new: true }
    );
    if (!service) return res.status(404).json({ message: "Service not found" });
    res.json(service);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update service" });
  }
};



// GET ALL SERVICES
exports.getServices = async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch services" });
  }
};


// DELETE SERVICE
exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findByIdAndDelete(id);
    if (!service) return res.status(404).json({ message: "Service not found" });
    res.json({ message: "Service deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete service" });
  }
};
