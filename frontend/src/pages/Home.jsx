// src/pages/Home.jsx
import React from "react";
import "./Home.css";
import { getImageUrl } from "../utils/imageUrl";
import { useNavigate } from "react-router-dom";
import hero from "../assets/images/hero.jpg";
import useServices from "../hooks/useServices";

export default function Home() {
  const navigate = useNavigate();
  const { services, loading } = useServices();

  return (
    <div className="home">

      {/* HERO */}
      <section className="hero">
        <div className="hero-text">
          <h1>Barber Booking App</h1>
          <p>
            Cut down on appointment admin and spend more time delivering
            sharp, confidence-boosting cuts.
          </p>
          <button className="btn-primary" onClick={() => navigate("/book")}>
            Book Appointment
          </button>
        </div>

        <div className="hero-image">
          <img src={hero} alt="Barber shop" />
        </div>
      </section>

      {/* TOOLS */}
      <section className="features-section">
        <h2>Tools Built for Modern Barbers</h2>
        <p className="section-subtitle">
          Designed to reduce no-shows, save time, and help you grow faster.
        </p>

        <div className="features-grid">
          <div className="feature-card">
            <h3>Create Your Booking Page</h3>
            <p>Let clients book instantly based on your real availability.</p>
          </div>
          <div className="feature-card">
            <h3>Automated Reminders</h3>
            <p>Email & SMS reminders that reduce missed appointments.</p>
          </div>
          <div className="feature-card">
            <h3>Skip the Queue</h3>
            <p>Clients arrive knowing the chair is reserved for them.</p>
          </div>
          <div className="feature-card">
            <h3>Mobile Friendly</h3>
            <p>Manage bookings anywhere, anytime.</p>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="services-preview">
        <h2>Popular Services</h2>

        <div className="service-cards">
          {loading
            ? <p>Loading services...</p>
            : services.filter((s) => s.active === true).slice(0, 3).map((service) => (
              <div
                key={service._id}
                className="service-card"
                onClick={() =>
                  navigate("/book", { state: { serviceId: service._id } })
                }
                style={{ cursor: "pointer" }}
              >
                <img
                  src={service.image ? getImageUrl(service.image) : "/placeholder.jpg"}
                  alt={service.name}
                />
                <h3>{service.name}</h3>
                <p>₹{service.price} • {service.duration} mins</p>
              </div>
            ))
          }
        </div>

        <button className="btn-primary" onClick={() => navigate("/services")}>
          View All Services
        </button>
      </section>

      {/* WHY + TESTIMONIALS */}
      <section className="trust-section">
        <div className="trust-card why-card">
          <h2>Why Choose Us</h2>
          <br />
          <div className="why-item">
            <span>💈</span>
            <div>
              <h4>Professional Barbers</h4>
              <p>Only skilled and verified professionals.</p>
            </div>
          </div>

          <div className="why-item">
            <span>⏱</span>
            <div>
              <h4>Zero Waiting</h4>
              <p>Appointments run on time, every time.</p>
            </div>
          </div>

          <div className="why-item">
            <span>📱</span>
            <div>
              <h4>Easy Booking</h4>
              <p>Book, reschedule, or cancel in seconds.</p>
            </div>
          </div>
        </div>

        <div className="trust-card testimonial-card-box">
          <h2>What Clients Say</h2>

          <div className="testimonial">
            <p>“Best haircut experience I’ve had. No waiting at all.”</p>
            <span>— John D.</span>
          </div>

          <div className="testimonial">
            <p>“Booking was smooth and reminders were super helpful.”</p>
            <span>— Sarah K.</span>
          </div>
        </div>
      </section>

    </div>
  );
}
