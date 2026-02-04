// src/pages/Services.jsx
import React from "react";
import "../App.css"; 
import { getImageUrl } from "../utils/imageUrl";
import { useNavigate } from "react-router-dom";
import useServices from "../hooks/useServices";

export default function Services() {
  const navigate = useNavigate();
  const { services, loading, error } = useServices();

  if (loading) return <p>Loading services...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="page-container services-page">
      <h2>Our Services</h2>
      <div className="grid-container">
        {services
          .filter((s) => s.active === true) // ONLY active services
          .map((service) => (
            <div
              key={service._id}
              className="card"
              onClick={() =>
                navigate("/book", { state: { serviceId: service._id } })
              }
              style={{ cursor: "pointer" }}
            >
              <img
                src={service.image ? getImageUrl(service.image) : "/placeholder.jpg"}
                alt={service.name}
                style={{ width: "100%", height: "150px", objectFit: "cover", borderRadius: "6px" }}
              />
              <h3>{service.name}</h3>
              <p>Duration: {service.duration} mins</p>
              <p>Price: ₹{service.price}</p>
            </div>
          ))}
      </div>
      <button
        className="btn-primary"
        style={{ marginTop: "30px" }}
        onClick={() => navigate("/book")}
      >
        Book Appointment
      </button>
    </div>
  );
}
