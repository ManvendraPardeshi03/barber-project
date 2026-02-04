import React from "react";
import { useNavigate } from "react-router-dom";
import "./Footer.css"; // optional: you can reuse home.css footer styles

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <h3>Barber Booking App</h3>
          <p>Modern scheduling built for modern barbers.</p>
        </div>

        <div>
          <h4>Quick Links</h4>
          <p style={{ cursor: "pointer" }} onClick={() => navigate("/")}>Home</p>
          <p style={{ cursor: "pointer" }} onClick={() => navigate("/services")}>Services</p>
          <p style={{ cursor: "pointer" }} onClick={() => navigate("/book")}>Appointments</p>
        </div>

        <div>
          <h4>Contact</h4>
          <p>📞 +91 98765 43210</p>
          <p>✉ info@barberapp.com</p>
        </div>

        <div>
          <h4>Get Started</h4>
          <button className="btn-primary" onClick={() => navigate("/book")}>
            Book Now
          </button>
        </div>
      </div>

      <div className="footer-bottom">
        © 2026 Barber Booking App
      </div>
      <p
        style={{ cursor: "pointer", textAlign: "center", marginTop: "10px" }}
        onClick={() => navigate("/barber/login")}
      >
        Barber Login
      </p>
    </footer>
  );
}