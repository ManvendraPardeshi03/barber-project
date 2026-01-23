const router = require("express").Router();
const { bookAppointment } = require("../controllers/appointmentController");
const { protect } = require("../middleware/authMiddleware");

router.post("/book", protect, bookAppointment);
module.exports = router;
