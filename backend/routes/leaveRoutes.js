const express = require("express");
const router = express.Router();
const { protect, barberOnly } = require("../middleware/authMiddleware");
const leaveController = require("../controllers/leaveController");

// GET all leaves for barber
router.get("/", protect, barberOnly, leaveController.getLeaves);

// POST add new leave
router.post("/", protect, barberOnly, leaveController.addLeave);

// DELETE remove a leave
router.delete("/:id", protect, barberOnly, leaveController.removeLeave);

module.exports = router;
