const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const path = require("path"); // <-- add this
const barberRoutes = require("./routes/barber.routes")
const cors = require("cors");

dotenv.config({ path: "./.env" });

// console.log("MONGO_URI =", process.env.MONGO_URI);

const app = express();
app.use(cors({
  origin: "*", // allow all domains (for testing)
  credentials: true,
}));
app.use(express.json());

// Serve uploaded images statically
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // <-- NEW

// Routes
const authRoutes = require("./routes/authRoutes");
const serviceRoutes = require("./routes/service.routes.js");
const appointmentRoutes = require("./routes/appointmentRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/barber", barberRoutes)
app.use("/api/appointments", appointmentRoutes);

// Connect DB
connectDB();

app.get("/", (req, res) => {
  res.send("Backend is running..!!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
