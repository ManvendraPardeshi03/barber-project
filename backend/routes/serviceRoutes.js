const router = require("express").Router();
const { createService, getServices } = require("../controllers/serviceController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/", protect, adminOnly, createService);
router.get("/", getServices);

module.exports = router;
