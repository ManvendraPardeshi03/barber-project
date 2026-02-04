const BarberLeave = require("../models/BarberLeave");

// GET all leaves for logged-in barber
const getLeaves = async (req, res) => {
  try {
    const leaves = await BarberLeave.find({ barberId: req.user._id }).sort({ date: -1 });
    res.json(leaves);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch leaves" });
  }
};

// POST a new leave
const addLeave = async (req, res) => {
  try {
    const { date, type, startTime, endTime } = req.body;

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    if (type === "FULL_DAY") {
      // block all leaves if a leave exists on that date
      const existingLeave = await BarberLeave.findOne({
        barberId: req.user._id,
        date,
      });

      if (existingLeave) {
        return res
          .status(409)
          .json({ message: "Leave already exists for this date" });
      }
    }

    if (type === "PARTIAL") {
      if (!startTime || !endTime) {
        return res
          .status(400)
          .json({ message: "Partial leave requires startTime and endTime" });
      }

      // allow multiple partial leaves, but optionally check overlap
      const overlappingLeave = await BarberLeave.findOne({
        barberId: req.user._id,
        date,
        type: "PARTIAL",
        $or: [
          { 
            $and: [
              { startTime: { $lte: startTime } },
              { endTime: { $gt: startTime } },
            ]
          },
          { 
            $and: [
              { startTime: { $lt: endTime } },
              { endTime: { $gte: endTime } },
            ]
          },
          { 
            $and: [
              { startTime: { $gte: startTime } },
              { endTime: { $lte: endTime } },
            ]
          }
        ]
      });

      if (overlappingLeave) {
        return res.status(409).json({ message: "Partial leave overlaps with existing slot" });
      }
    }

    const leaveData = {
      barberId: req.user._id,
      date,
      type,
    };

    if (type === "PARTIAL") {
      leaveData.startTime = startTime;
      leaveData.endTime = endTime;
    }

    const leave = await BarberLeave.create(leaveData);
    return res.status(201).json(leave);

  } catch (err) {
    console.error("ADD LEAVE ERROR:", err);
    return res.status(500).json({ message: "Failed to add leave" });
  }
};


// DELETE a leave by ID
const deleteLeave = async (req, res) => {
  try {
    const leave = await BarberLeave.findOneAndDelete({
      _id: req.params.id,
      barberId: req.user._id,
    });

    if (!leave) return res.status(404).json({ message: "Leave not found" });

    res.json({ message: "Leave removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete leave" });
  }
};

module.exports = { getLeaves, addLeave, deleteLeave };
