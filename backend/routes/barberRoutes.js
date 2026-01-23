const router = require("express").Router();
const { createBarber, getBarbers } = require("../controllers/barberController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Admin creates a barber
router.post("/", protect, adminOnly, createBarber);

// Anyone can get list of barbers
router.get("/", getBarbers);

module.exports = router;
