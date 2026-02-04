import React, { useState, useEffect } from "react";
import API from "../utils/api";

const LeaveDays = () => {
  const [date, setDate] = useState("");
  const [type, setType] = useState("FULL_DAY");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [leaveDays, setLeaveDays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null });

  const normalizeDate = (d) => new Date(d).toLocaleDateString("en-CA");
  const today = new Date().toLocaleDateString("en-CA");

  // Fetch leaves
  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await API.get("/barber/leaves");
      setLeaveDays(res.data);
    } catch (err) {
      console.error("Failed to fetch leaves", err);
      setError("Failed to fetch leaves from server.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  // Add leave
  const addLeaveDay = async () => {
    setError("");

    if (!date) {
      setError("Please select a date.");
      return;
    }

    if (type === "PARTIAL" && (!startTime || !endTime)) {
      setError("Please select both start and end time.");
      return;
    }

    if (type === "PARTIAL" && startTime >= endTime) {
      setError("End time must be later than start time.");
      return;
    }

    try {
      const payload = {
        date,
        type,
        startTime: type === "PARTIAL" ? startTime : null,
        endTime: type === "PARTIAL" ? endTime : null,
      };

      const res = await API.post("/barber/leaves", payload);
      setLeaveDays([...leaveDays, res.data]);

      setDate("");
      setType("FULL_DAY");
      setStartTime("");
      setEndTime("");
      setError("");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to add leave.");
    }
  };

  // Delete handlers
  const handleDeleteClick = (id) =>
    setConfirmDelete({ show: true, id });

  const confirmDeleteLeave = async () => {
    try {
      await API.delete(`/barber/leaves/${confirmDelete.id}`);
      setLeaveDays(
        leaveDays.filter((l) => l._id !== confirmDelete.id)
      );
    } catch (err) {
      console.error(err);
      setError("Failed to remove leave.");
    } finally {
      setConfirmDelete({ show: false, id: null });
    }
  };

  const cancelDelete = () =>
    setConfirmDelete({ show: false, id: null });

  // Sorting
  const sortedLeaveDays = [...leaveDays].sort((a, b) => {
    const dateA = normalizeDate(a.date);
    const dateB = normalizeDate(b.date);

    if (dateA !== dateB) return dateA.localeCompare(dateB);

    if (a.type === "PARTIAL" && b.type === "PARTIAL") {
      return a.startTime.localeCompare(b.startTime);
    }

    if (a.type === "FULL_DAY") return -1;
    if (b.type === "FULL_DAY") return 1;

    return 0;
  });

  // Derived UI data
  const todayLeave = leaveDays.find(
    (l) => normalizeDate(l.date) === today
  );

  const upcomingLeaves = leaveDays.filter(
    (l) => normalizeDate(l.date) > today
  );

  const hasTodayLeave = leaveDays.some(
    (l) => normalizeDate(l.date) === today
  );

  const fullDayCount = leaveDays.filter(
    (l) => l.type === "FULL_DAY"
  ).length;

  const partialDayCount = leaveDays.filter(
    (l) => l.type === "PARTIAL"
  ).length;

  const nextLeave =
    upcomingLeaves.length > 0
      ? normalizeDate(
          upcomingLeaves
            .sort((a, b) =>
              normalizeDate(a.date).localeCompare(
                normalizeDate(b.date)
              )
            )[0].date
        )
      : hasTodayLeave
      ? today
      : "None";

  return (
    <div className="page-container">
      <h2>Leave Days</h2>
      <p>
        Mark days when you are unavailable. Appointments will be blocked
        automatically.
      </p>

      {/* Summary Cards */}
      <div className="leave-summary">
        <div className="card">
          <h4>Availability Today</h4>
          <p>{todayLeave ? "On Leave ❌" : "Available ✅"}</p>
        </div>
        <div className="card">
          <h4>Upcoming Leaves</h4>
          <p>
            {upcomingLeaves.length > 0
              ? upcomingLeaves.length
              : hasTodayLeave
              ? 1
              : 0}
          </p>
        </div>
        <div className="card">
          <h4>Next Leave</h4>
          <p>{nextLeave}</p>
        </div>
        <div className="card">
          <h4>Leave Breakdown</h4>
          <p>Full Day: {fullDayCount}</p>
          <p>Partial: {partialDayCount}</p>
        </div>
      </div>

      {/* Add Leave Section */}
      <div className="card" style={{ marginTop: "30px", marginBottom: "30px" }}>
        <h4 className="leave-section-title">Add Leave</h4>
        <div className="leave-add-form">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={today}
          />

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            style={{ marginLeft: "10px" }}
          >
            <option value="FULL_DAY">Full Day</option>
            <option value="PARTIAL">Partial</option>
          </select>

          {type === "PARTIAL" && (
            <>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                style={{ marginLeft: "10px" }}
              />
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                style={{ marginLeft: "10px" }}
              />
            </>
          )}

          <button onClick={addLeaveDay} style={{ marginLeft: "10px" }}>
            Add
          </button>

          {error && (
            <div
              style={{
                marginTop: "1px",
                marginLeft: "20px",
                padding: "6px 10px",
                backgroundColor: "#fff3cd",
                color: "#856404",
                border: "1px solid #ffeeba",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: 500,
                display: "inline-block",
              }}
            >
              ⚠ {error}
            </div>
          )}
        </div>
      </div>

      {/* Leave List */}
      <div style={{ marginTop: "30px" }}>
        <h4 className="leave-section-title">Upcoming Leave Days</h4>

        {loading ? (
          <p>Loading leaves...</p>
        ) : leaveDays.length === 0 ? (
          <p>No leave days added. You are fully available for bookings.</p>
        ) : (
          <ul className="leave-list">
            {sortedLeaveDays.map((l) => {
              const isToday = normalizeDate(l.date) === today;
              const leaveDate = new Date(l.date).toLocaleDateString();

              return (
                <li
                  key={l._id}
                  style={{
                    padding: "10px",
                    marginBottom: "8px",
                    border: "1px solid #ddd",
                    background: isToday ? "#fff3cd" : "#fff",
                  }}
                >
                  <div>
                    <strong>{leaveDate}</strong>{" "}
                    {isToday && (
                      <span className="leave-badge today">(Today)</span>
                    )}
                    <br />
                    <span
                      className={`leave-badge ${
                        l.type === "FULL_DAY" ? "full" : "partial"
                      }`}
                    >
                      {l.type === "FULL_DAY" ? "Full" : "Partial"}
                    </span>
                    <div>
                      {l.type === "FULL_DAY"
                        ? "Full Day Leave"
                        : `Partial Leave: ${l.startTime} - ${l.endTime}`}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteClick(l._id)}
                    style={{ marginLeft: "10px" }}
                  >
                    ❌
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Delete Modal */}
      {confirmDelete.show && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "8px",
              width: "300px",
              textAlign: "center",
            }}
          >
            <p>Are you sure you want to remove this leave?</p>
            <button
              onClick={confirmDeleteLeave}
              style={{
                marginRight: "10px",
                backgroundColor: "#dc3545",
                color: "#fff",
                padding: "5px 10px",
                borderRadius: "4px",
                border: "none",
              }}
            >
              Yes
            </button>
            <button
              onClick={cancelDelete}
              style={{
                backgroundColor: "#6c757d",
                color: "#fff",
                padding: "5px 10px",
                borderRadius: "4px",
                border: "none",
              }}
            >
              No
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveDays;
