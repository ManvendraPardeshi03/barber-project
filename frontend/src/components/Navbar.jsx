// src/components/Navbar.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {

  return (
    <nav>
      <h2>Barber App</h2>
      <div>
        <Link to="/">Home</Link>
        <Link to="/services">Services</Link>
        <Link to="/book">Book Appointment</Link>
      </div>
    </nav>
  );
}
