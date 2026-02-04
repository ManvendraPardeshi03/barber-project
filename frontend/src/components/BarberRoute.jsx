// src/components/BarberRoute.jsx
import { Navigate } from "react-router-dom";

export default function BarberRoute({ children }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  // ✅ only allow logged-in barber
  if (!token || !user || user.role !== "barber") {
    return <Navigate to="/barber/login" />;
  }

  return children;
}
