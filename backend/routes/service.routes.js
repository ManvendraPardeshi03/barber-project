const express = require("express");
const router = express.Router();

const {
  createService,
  getServices,
  updateService,
  deleteService,
} = require("../controllers/serviceController");

const upload = require("../middleware/uploadMiddleware");
const { protect, barberOnly } = require("../middleware/authMiddleware");
const Service = require("../models/Service");

/* ================= IMAGE UPLOAD ================= */
router.post("/upload", protect, barberOnly, upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No image uploaded" });
  }

  res.json({
    url: `/uploads/${req.file.filename}`,
  });
});

/* ================= SEED SERVICES ================= */
router.post("/seed", async (req, res) => {
  try {
    await Service.deleteMany();

    const services = await Service.insertMany([
      { name: "Hair Cut", duration: 30, price: 80, image: "/uploads/haircut.jpg", active: true },
      { name: "Beard Trim", duration: 20, price: 40, image: "/uploads/beardtrim.jpg", active: true },
      { name: "Premium Grooming", duration: 90, price: 200, image: "/uploads/premiumgrooming.webp", active: true },
      { name: "Clean Shave", duration: 15, price: 40, image: "/uploads/cleanshave.jpg", active: true },
      { name: "Facial", duration: 30, price: 50, image: "/uploads/facial.jpg", active: true },
      { name: "Hair Color", duration: 60, price: 60, image: "/uploads/haircolor.jpg", active: true },
      { name: "Head Massage", duration: 15, price: 30, image: "/uploads/headmassage.jpg", active: true },
      { name: "Kids Haircut", duration: 20, price: 50, image: "/uploads/kidshaircut.jpg", active: true },
    ]);

    res.json(services);
  } catch (error) {
    console.error("Seed Error:", error.message);
    res.status(500).json({ message: "Seed failed" });
  }
});

/* ================= PUBLIC ================= */
router.get("/", getServices);

/* ================= BARBER ONLY ================= */
router.post("/", protect, barberOnly, createService);
router.put("/:id", protect, barberOnly, updateService);
router.delete("/:id", protect, barberOnly, deleteService);

module.exports = router;
