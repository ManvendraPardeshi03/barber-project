import React, { useEffect, useState, useRef } from "react";
import API from "../utils/api";
import { parseSlotUTCtoLocal } from "../utils/date";

const normalizeServices = (services = []) => {
  if (!Array.isArray(services)) return [];

  return services.map((s) => {
    // If backend already sends full service object
    if (typeof s === "object" && s !== null) {
      return {
        name: s.name || "Unknown",
        price: s.price || 0,
      };
    }

    // If backend sends only service ID (history case)
    return {
      name: "Service",
      price: 0,
    };
  });
};


// Simple Toast Component for Notifications
const Toast = ({ message, onClose }) => (
  <div className="toast">
    {message} <span className="toast-close" onClick={onClose}>×</span>
  </div>
);

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("today");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("date");
  const [toasts, setToasts] = useState([]);
  const notifiedRef = useRef(new Set());

  // ---------------- FETCH APPOINTMENTS ----------------
  const fetchAppointments = async () => {
    try {
      const res = await API.get("/barber/appointments");
      setAppointments(res.data || []);
    } catch (err) {
      console.error("Failed to fetch appointments", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // ---------------- UPDATE STATUS ----------------
  const handleStatusChange = async (id, newStatus) => {
    try {
      await API.put(`/barber/appointments/${id}/status`, { status: newStatus });
      fetchAppointments();
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  // ---------------- TIME HELPERS ----------------
  const now = new Date();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
const today = new Date().toISOString().split("T")[0]; // ✅ ADD THIS

  // ---------------- CLASSIFICATION ----------------
  const todayAppointments = appointments.filter((a) => {
    const start = parseSlotUTCtoLocal(a.startTime);
    return start >= startOfToday && start <= endOfToday && a.status !== "cancelled" && a.status !== "completed" && a.informed !== true;
  });

  const completedToday = appointments
    .filter((a) => {
      const end = parseSlotUTCtoLocal(a.endTime);
      return (
        end >= startOfToday &&
        end <= endOfToday &&
        a.status === "completed"
      );
    })
    .sort((a, b) => parseSlotUTCtoLocal(a.endTime) - parseSlotUTCtoLocal(b.endTime));

  const upcomingAppointments = appointments.filter((a) => {
    const start = parseSlotUTCtoLocal(a.startTime);
    return start > now && a.status !== "cancelled" && a.status !== "completed" && a.informed !== true;
  });

  const historyAppointments = appointments
    .filter((a) => (a.status === "completed"))
    .sort((a, b) => parseSlotUTCtoLocal(b.endTime) - parseSlotUTCtoLocal(a.endTime));


  // ---------------- SUMMARY / QUICK STATS ----------------
  const completedTodayCount = completedToday.length;
  const completedTodayEarnings = completedToday.reduce((sum, a) => {
  const services = normalizeServices(a.services);
  const servicePrice = services.reduce((s, svc) => s + (svc.price || 0), 0);
  return sum + servicePrice;
}, 0);


  // const pendingTodayCount = todayAppointments.filter((a) => a.status === "pending").length;
  // const confirmedTodayCount = todayAppointments.filter((a) => a.status === "confirmed").length;

  // ---------------- HELPER ----------------
  const getActiveAppointments = () => {
    // if (activeTab === "today") return todayAppointments.filter((a) => a.status !== "completed");
    if (activeTab === "today") return todayAppointments
    if (activeTab === "upcoming") return upcomingAppointments;
    if (activeTab === "history") return historyAppointments;
    return [];
  };

// ---------------- SEARCH + FILTER + SORT ----------------
let filteredAppointments = getActiveAppointments().filter((a) => {
  if (!searchTerm) return true;
  const nameMatch = a.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
  const phoneMatch = a.customerPhone?.includes(searchTerm);
  return nameMatch || phoneMatch;
});


  // ---------------- SORTING ----------------
filteredAppointments = filteredAppointments.sort((a, b) => {
  if (sortOption === "date") {
    const startA = parseSlotUTCtoLocal(a.startTime);
    const startB = parseSlotUTCtoLocal(b.startTime);

    // History → latest first, others → earliest first
    if (activeTab === "history") return startB - startA;
    return startA - startB;
  }

  if (sortOption === "name") {
    return (a.customerName || "").localeCompare(b.customerName || "");
  }

  if (sortOption === "price") {
  const priceA = normalizeServices(a.services).reduce((sum, s) => sum + s.price, 0);
  const priceB = normalizeServices(b.services).reduce((sum, s) => sum + s.price, 0);
  return priceB - priceA;
  }


  return 0;
});


  // ---------------- EXPORT FUNCTIONS ----------------
  const exportCSV = (appointmentsToExport, filename) => {
    if (appointmentsToExport.length === 0) return alert("No appointments to export.");
    const csvHeader = ["Customer Name", "Phone", "Date", "Time", "Services", "Price", "Status"];
    const csvRows = appointmentsToExport.map((a) => {
      const start = parseSlotUTCtoLocal(a.startTime);
      const services = normalizeServices(a.services);
      // const today = new Date().toISOString().split("T")[0];
      return [
        a.customerName,
        a.customerPhone,
        start.toISOString().split("T")[0],
        `${start.toLocaleTimeString()} - ${parseSlotUTCtoLocal(a.endTime).toLocaleTimeString()}`,
        services.map(s => s.name).join(", "),
        services.reduce((sum, s) => sum + s.price, 0),
        a.status,
      ]
     });
    const csvContent = [csvHeader, ...csvRows]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
  };

const exportTodayCSV = () => exportCSV(todayAppointments, `Appointments_Today_${today}.csv`);
const exportUpcomingCSV = () => exportCSV(upcomingAppointments, `Appointments_Upcoming_${today}.csv`);
const exportHistoryCSV = () => exportCSV(historyAppointments, `Appointment_History_${today}.csv`);


  // ---------------- HISTORY GROUPING (MONTH-WISE) ----------------
  const groupHistoryByMonth = (list) => {
    return list.reduce((acc, a) => {
      const date = parseSlotUTCtoLocal(a.startTime);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (!acc[key]) {
        acc[key] = {
          label: date.toLocaleString("default", { month: "long", year: "numeric" }),
          appointments: [],
          totalEarnings: 0,
        };
      }
      acc[key].appointments.push(a);
      const services = normalizeServices(a.services);
      const servicePrice = services.reduce((sum, s) => sum + s.price, 0);
      acc[key].totalEarnings += servicePrice;
      return acc;
    }, {});
  };

// ---------------- TOAST NOTIFICATIONS ----------------
useEffect(() => {
  const checkUpcomingAppointments = () => {
    upcomingAppointments.forEach((a) => {
      const start = parseSlotUTCtoLocal(a.startTime);
      const diffMins = (start - new Date()) / (1000 * 60);

      // ⏰ 15 minute reminder
      if (diffMins > 0 && diffMins <= 15) {
        if (!notifiedRef.current.has(a._id)) {
          notifiedRef.current.add(a._id);

          const toastId = Date.now() + Math.random();

          setToasts((prev) => [
            ...prev,
            {
              id: toastId,
              message: `⏰ Reminder: ${a.customerName} at ${start.toLocaleTimeString()}`,
            },
          ]);

          // ⏳ Auto-remove toast after 6 sec
          setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== toastId));
          }, 6000);
        }
      }
    });
  };

  // 🔥 RUN IMMEDIATELY
  checkUpcomingAppointments();

  // 🔁 THEN RUN EVERY MINUTE
  const interval = setInterval(checkUpcomingAppointments, 60000);

  return () => clearInterval(interval);
}, [upcomingAppointments]);



  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  function roundUpToNext30Min(date) {
    const mins = 30;
    const ms = mins * 60 * 1000;
    return new Date(Math.ceil(date.getTime() / ms) * ms);
  }

  if (loading) return <p>Loading appointments...</p>;

  return (
    <div className="page-container">
      <h2>Appointments ✂️</h2>

      {/* -------- QUICK STATS / DAILY SUMMARY -------- */}
      <div className="quick-stats">
        <div>Today's Appointments: {todayAppointments.length}</div>
        <div>Completed Today: {completedTodayCount}</div>
        <div>Total Earnings Today: ₹{completedTodayEarnings}</div>
        <div>Upcoming Appointments: {upcomingAppointments.length}</div>
      </div>

      {/* -------- SEARCH & SORT -------- */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by customer name or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="sort-bar">
        <label>Sort By:</label>
        <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
          <option value="date">Date/Time</option>
          <option value="name">Customer Name</option>
          <option value="price">Price</option>
        </select>
      </div>

      {/* -------- TABS -------- */}
      <div className="tabs">
        <button onClick={() => setActiveTab("today")}>Today</button>
        <button onClick={() => setActiveTab("upcoming")}>Upcoming</button>
        <button onClick={() => setActiveTab("history")}>History</button>
      </div>

      {/* -------- EXPORT BUTTONS -------- */}
      <div className="export-buttons">
        {activeTab === "today" && <button onClick={exportTodayCSV}>Export Today</button>}
        {activeTab === "upcoming" && <button onClick={exportUpcomingCSV}>Export Upcoming</button>}
        {activeTab === "history" && <button onClick={exportHistoryCSV}>Export History</button>}
      </div>

      {/* -------- TODAY COMPLETED SUMMARY -------- */}
      {activeTab === "today" && completedTodayCount > 0 && (
        <div className="completed-summary">
          <h3>Completed Today ({completedTodayCount})</h3>
          <p>Total Earnings: ₹{completedTodayEarnings}</p>
          {completedToday.map((a) => {
            const end = parseSlotUTCtoLocal(a.endTime);
            return (
              <div key={a._id} className="appointment-card completed">
                <p>
                  <strong>{a.customerName}</strong> - Completed
                </p>
                <p>Time: {end.toLocaleTimeString()}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* -------- LIST OF ACTIVE APPOINTMENTS -------- */}
      {filteredAppointments.length === 0 ? (
        <p className="no-results">No results found.</p>
      ) : activeTab === "history" ? (
        Object.values(groupHistoryByMonth(filteredAppointments)).map((month, idx) => (
          <div key={idx} className="history-month">
            <h3>{month.label}</h3>
            <p>
              Total Appointments: {month.appointments.length} | Total Earnings: ₹{month.totalEarnings}
            </p>
            {month.appointments.map((a) => {
              const start = parseSlotUTCtoLocal(a.startTime);
              const end = parseSlotUTCtoLocal(a.endTime);
              const services = normalizeServices(a.services);
              const servicePrice = services.reduce((sum, s) => sum + (s.price || 0), 0);
              return (
                <div key={a._id} className="appointment-card history">
                  <p><strong>Name:</strong> {a.customerName}</p>
                  <p><strong>Phone:</strong> {a.customerPhone}</p>
                  <p>
                    <strong>Date & Time:</strong> {start.toLocaleDateString()} | {start.toLocaleTimeString()} - {end.toLocaleTimeString()}
                  </p>

                  <p><strong>Status:</strong> {a.status}</p>
                  <p><strong>Services:</strong> {services.map(s => s.name).join(", ")}</p>
                  <p><strong>Price:</strong> ₹{servicePrice}</p>
                </div>
              );
            })}
          </div>
        ))
      ) : (
        filteredAppointments.map((a) => {
          const start = roundUpToNext30Min(parseSlotUTCtoLocal(a.startTime));
          const end = parseSlotUTCtoLocal(a.endTime);
          const endTime = parseSlotUTCtoLocal(a.endTime);
          const services = normalizeServices(a.services);
          const servicePrice = services.reduce((sum, s) => sum + (s.price || 0), 0);
          return (
            <div key={a._id} className="appointment-card">
              <p><strong>Name:</strong> {a.customerName}</p>
              <p><strong>Phone:</strong> {a.customerPhone}</p>
              <p>
                <strong>Date:</strong> {start.toLocaleDateString()} <strong>Time:</strong> {start.toLocaleTimeString()} - {end.toLocaleTimeString()}
              </p>
              <p><strong>Status:</strong> {a.status}</p>
              <p><strong>Services:</strong> {services.map(s => s.name).join(", ") || "None"}</p>
              <p><strong>Price:</strong> ₹{servicePrice}</p>
              {activeTab !== "history" && a.status !== "cancelled" && a.status !== "completed" && (
                <div className="appointment-actions">
                  <button
                    onClick={() => handleStatusChange(a._id, "completed")}
                    disabled={endTime > now} // Use parsed local time
                    title={
                      endTime > now
                        ? `Can mark as completed after ${endTime.toLocaleTimeString()}`
                        : "Mark as completed"
                    }
                  >
                    Mark as Completed
                  </button>
                </div>
              )}
            </div>
          );
        })
      )}

      {/* -------- TOAST NOTIFICATIONS -------- */}
      <div className="toast-container">
        {toasts.map((t) => (
          <Toast key={t.id} message={t.message} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </div>
  );
}
