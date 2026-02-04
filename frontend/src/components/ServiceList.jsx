// src/components/ServiceList.jsx
import React, { useEffect, useState } from "react";
import API from "../utils/api";

export default function ServiceList({ selectedServices, setSelectedServices }) {
  const [services, setServices] = useState([]);

  useEffect(() => {
    API.get("/services")
      .then((res) => setServices(res.data))
      .catch((err) => console.error(err));
  }, []);

  const toggleService = (service) => {
    const exists = selectedServices.find((s) => s._id === service._id);
    if (exists) {
      setSelectedServices(selectedServices.filter((s) => s._id !== service._id));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  return (
    <div>
      <h3>Select Services</h3>
      {services.length === 0 && <p>No services available</p>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" }}>
        {services
        .filter((service) => service.active === true)
        .map((service) => (
          <div key={service._id} className={`card ${selectedServices.some((s) => s._id === service._id) ? "selected" : ""}`} onClick={() => toggleService(service)}>
            <img
              src={service.image ? `http://localhost:5000${service.image}` : "/placeholder.jpg"}
              alt={service.name}
              style={{
                width: "100%",
                height: "120px",
                objectFit: "cover",
                borderRadius: "6px",
                marginBottom: "8px",
              }}
            />
            <input type="checkbox" checked={selectedServices.some((s) => s._id === service._id)} readOnly />
            <strong>{service.name}</strong>
            <div>{service.duration} mins</div>
            <div>₹{service.price}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
