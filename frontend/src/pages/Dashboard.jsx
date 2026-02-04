import React, { useEffect, useState } from "react";
import API from "../utils/api";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nextAppointmentCountdown, setNextAppointmentCountdown] = useState("");
  const [revenueToday, setRevenueToday] = useState(0);
  const [revenueUpcoming, setRevenueUpcoming] = useState(0);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await API.get("/barber/dashboard");
      setData(res.data);
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const handleLeaveUpdate = () => fetchDashboardData();
    window.addEventListener("leaveUpdated", handleLeaveUpdate);
    return () => window.removeEventListener("leaveUpdated", handleLeaveUpdate);
  }, []);

  // Countdown for next appointment
  useEffect(() => {
    if (!data) return;
    const updateCountdown = () => {
      const upcoming = data.appointments.upcoming;
      if (!upcoming || upcoming.length === 0) {
        setNextAppointmentCountdown("No upcoming appointments");
        return;
      }
      const nextAppt = new Date(upcoming[0].startTime);
      const now = new Date();
      const diffMs = nextAppt - now;
      if (diffMs <= 0) {
        setNextAppointmentCountdown("Next appointment is now or passed");
        return;
      }
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      setNextAppointmentCountdown(`${hours}h ${minutes}m until next appointment`);
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [data]);

  // Revenue calculations
  useEffect(() => {
    if (!data) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const revenueTodayCalc = data.appointments.upcoming
  .filter(a => {
    const start = new Date(a.startTime);
    return start.getFullYear() === today.getFullYear() &&
           start.getMonth() === today.getMonth() &&
           start.getDate() === today.getDate();
  })
  .reduce((sum, a) => {
    const serviceSum = a.services?.reduce((s, svc) => s + Number(svc.price || 0), 0) || 0;
    return sum + serviceSum;
  }, 0);


    const revenueUpcomingCalc = data.appointments.upcoming.reduce((sum, a) => {
  const serviceSum = a.services?.reduce((s, svc) => s + Number(svc.price || 0), 0) || 0;
  return sum + serviceSum;
}, 0);


    setRevenueToday(revenueTodayCalc);
    setRevenueUpcoming(revenueUpcomingCalc);
  }, [data]);

  if (loading) return <p>Loading dashboard...</p>;
  if (!data) return <p>Failed to load dashboard</p>;

  const totalServicesCount = data.appointments.upcoming.reduce((sum, a) => sum + (a.services?.length || 0), 0);
  const today = new Date();
  const todayDay = today.getDay(); // 4 = Thursday
  const isStoreClosedToday = todayDay === 4 || data.leaves.onLeaveToday;
  const isBarberOnLeaveToday = data.leaves.onLeaveToday;

  // ------------------------------
  // Conflicted appointments (on leave days and NOT yet informed)
  const conflictedAppointments = data.appointments.upcoming.filter(a => {
    const apptDate = new Date(a.startTime).toDateString();
    return data.leaves.allLeaves?.some(
      l => new Date(l.date).toDateString() === apptDate
    ) && !a.informed;
  });

  // Normal upcoming appointments (exclude conflicted/informed)
  const normalAppointments = data.appointments.upcoming.filter(
    a => !conflictedAppointments.includes(a)
  );

  // ------------------------------
      // Mark appointment as informed
      const markInformed = async (appointmentId) => {
      try {
        await API.put(`/barber/appointments/${appointmentId}/inform`);

        // 🔥 REMOVE appointment from dashboard upcoming immediately
        setData(prev => ({
          ...prev,
          appointments: {
            ...prev.appointments,
            upcoming: prev.appointments.upcoming.filter(
              a => a._id !== appointmentId
            )
          }
        }));
      } catch (err) {
        console.error("Failed to mark informed:", err);
      }
    };

  return (
    <div className="page-container">
      <h2>Welcome, Barber ✂️</h2>
      <p style={{ color: "#666" }}>Overview of your shop activity</p>

      {/* SUMMARY CARDS */}
      <div className="dashboard-cards">
        <div className="card">
          <h3>📅 Total Appointments</h3>
          <p>{data.appointments.total}</p>
        </div>

        <div className="card">
          <h3>🕒 Today</h3>
          <p style={{ color: isStoreClosedToday || isBarberOnLeaveToday ? "red" : "black" }}>
            {isStoreClosedToday || isBarberOnLeaveToday ? "Closed / On Leave" : data.appointments.today}
          </p>
        </div>

        <div className="card">
          <h3>🛠 Services</h3>
          <p>{totalServicesCount}</p>
        </div>

        <div className="card">
          <h3>🏖 Leave Today</h3>
          <p style={{ color: (isBarberOnLeaveToday || isStoreClosedToday) ? "red" : "green" }}>
            {(isBarberOnLeaveToday || isStoreClosedToday) ? "Yes" : "No"}
          </p>
        </div>

        <div className="card">
          <h3>🏪 Store Status</h3>
          <p style={{ color: isStoreClosedToday ? "red" : "green" }}>
            {todayDay === 4 ? "Closed Today (Thursday)" 
              : data.leaves.onLeaveToday ? "Closed (Barber on Leave)" 
              : "Open Today"}
          </p>
        </div>

        <div className="card">
          <h3>💰 Revenue Today</h3>
          <p>₹{revenueToday}</p>
        </div>

        <div className="card">
          <h3>💰 Total Upcoming Revenue</h3>
          <p>₹{revenueUpcoming}</p>
        </div>

        <div className="card">
          <h3>🔔 Next Appointment</h3>
          <p>{nextAppointmentCountdown}</p>
        </div>
      </div>

      {/* CONFLICTED APPOINTMENTS */}
      {conflictedAppointments.length > 0 && (
        <>
          <h3 style={{ marginTop: "30px", color: "red" }}>
            ⚠️ Appointments on Leave Days
          </h3>
          {conflictedAppointments.map(a => {
            const apptDate = new Date(a.startTime);
            return (
              <div key={a._id} className="appointment-card" style={{ border: "1px solid red", padding: "10px", marginBottom: "10px" }}>
                <p><strong>Name:</strong> {a.customerName}</p>
                <p><strong>Phone:</strong> {a.customerPhone}</p>
                <p><strong>Date:</strong> {apptDate.toLocaleDateString()} , <strong>Time:</strong> {apptDate.toLocaleTimeString()}</p>
                <p><strong>Services:</strong> {a.services?.map(s => s.name).join(", ")}</p>
                <p><strong>Price:</strong> ₹{a.services?.reduce((sum, s) => sum + (s.price || 0), 0)}</p>

                {!a.informed && (
                  <button
                    style={{ marginTop: "5px", backgroundColor: "orange", color: "white", padding: "5px 10px", border: "none", borderRadius: "5px", cursor: "pointer" }}
                    onClick={() => markInformed(a._id)}
                  >
                    Mark as Informed
                  </button>
                )}

                {a.informed && <p style={{ color: "green", fontWeight: "bold", marginTop: "5px" }}>Informed ✅</p>}
              </div>
            );
          })}
        </>
      )}

      {/* NORMAL UPCOMING APPOINTMENTS */}
      <h3 style={{ marginTop: "30px" }}>Upcoming Appointments</h3>
      {normalAppointments.length === 0 ? (
        <p>No upcoming appointments</p>
      ) : (
        normalAppointments.map(a => {
          const apptDate = new Date(a.startTime);
          return (
            <div key={a._id} className="appointment-card">
              <p><strong>Name:</strong> {a.customerName}</p>
              <p><strong>Phone:</strong> {a.customerPhone}</p>
              <p><strong>Date:</strong> {apptDate.toLocaleDateString()} , <strong>Time:</strong> {apptDate.toLocaleTimeString()}</p>
              <p><strong>Services:</strong> {a.services?.map(s => s.name).join(", ") || "None selected"}</p>
              <p><strong>Price:</strong> ₹{a.services?.reduce((sum, s) => sum + (s.price || 0), 0) || 0}</p>
            </div>
          );
        })
      )}

      {/* QUICK ACTIONS */}
      <div className="dashboard-actions">
        <button onClick={() => navigate("/barber/appointments")}>View All Appointments</button>
        <button onClick={() => navigate("/barber/leave-days")} style={{ marginLeft: "10px" }}>Manage Leave</button>
      </div>
    </div>
  );
}
