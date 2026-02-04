const BarberLeave = require("../models/BarberLeave");

const getLeaves = async (req, res) => {
  try {
    const leaves = await BarberLeave.find({ barberId: req.user._id }).sort({ date: 1 });
    res.json(leaves);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch leaves" });
  }
};

const addLeave = async (req, res) => {
  try {
    const { date, type, startTime, endTime } = req.body;
    if (!date) return res.status(400).json({ message: "Date is required" });

    const leaveData = {
      barberId: req.user._id,
      date,
      type: type || "FULL_DAY",
    };

    if (type === "PARTIAL") {
      if (!startTime || !endTime)
        return res.status(400).json({ message: "Partial leave requires startTime and endTime" });
      leaveData.startTime = new Date(startTime);
      leaveData.endTime = new Date(endTime);
    }

    const leave = await BarberLeave.create(leaveData);
    res.status(201).json(leave);
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(409).json({ message: "Leave already exists for this date" });
    }
    res.status(500).json({ message: "Failed to add leave" });
  }
};

const removeLeave = async (req, res) => {
  try {
    const { id } = req.params;
    await BarberLeave.deleteOne({ _id: id, barberId: req.user._id });
    res.json({ message: "Leave removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to remove leave" });
  }
};

module.exports = { getLeaves, addLeave, removeLeave };
