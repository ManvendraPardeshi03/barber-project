import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import PublicLayout from "./components/PublicLayout";
import BarberLayout from "./components/BarberLayout";
import BarberRoute from "./components/BarberRoute";

import Home from "./pages/Home";
import Services from "./pages/Services";
import BookAppointment from "./pages/BookAppointment";
import ManageServices from "./pages/ManageServices";
import LoginForm from "./components/LoginForm";

import Dashboard from "./pages/Dashboard";
import LeaveDays from "./pages/LeaveDays";
import AppointmentHistory from "./components/AppointmentHistory";

function App() {
  return (
    <Router>
      <Routes>

        {/* 🌍 PUBLIC AREA */}
        <Route
          path="/"
          element={
            <PublicLayout>
              <Home />
            </PublicLayout>
          }
        />

        <Route
          path="/services"
          element={
            <PublicLayout>
              <Services />
            </PublicLayout>
          }
        />

        <Route
          path="/book"
          element={
            <PublicLayout>
              <BookAppointment />
            </PublicLayout>
          }
        />

        <Route path="/barber/login" element={<LoginFormWrapper />} />

        {/* 🔒 BARBER AREA */}
        <Route
          path="/barber/dashboard"
          element={
            <BarberRoute>
              <BarberLayout>
                <Dashboard />
              </BarberLayout>
            </BarberRoute>
          }
        />

        <Route
          path="/barber/appointments"
          element={
            <BarberRoute>
              <BarberLayout>
                <AppointmentHistory />
              </BarberLayout>
            </BarberRoute>
          }
        />

        <Route
          path="/barber/services"
          element={
            <BarberRoute>
              <BarberLayout>
                <ManageServices />
              </BarberLayout>
            </BarberRoute>
          }
        />

        <Route
          path="/barber/leave-days"
          element={
            <BarberRoute>
              <BarberLayout>
                <LeaveDays />
              </BarberLayout>
            </BarberRoute>
          }
        />

        {/* ❗ FALLBACK */}
        <Route path="*" element={<h2>404 Page Not Found</h2>} />

      </Routes>
    </Router>
  );
}

function LoginFormWrapper() {
  const [user, setUser] = useState(null);
  return <LoginForm setUser={setUser} />;
}

export default App;
