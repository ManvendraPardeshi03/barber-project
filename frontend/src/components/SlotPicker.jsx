import React, { useEffect, useState } from "react";
import { parseSlotUTCtoLocal } from "../utils/date";

import API from "../utils/api";

export default function SlotPicker({ date, totalTime, selectedSlot, setSelectedSlot }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!date) {
      setSlots([]);
      return;
    }

    setLoading(true);
    API.get("/appointments/available-slots", {
      params: {
        barberId: "6973dce50100ee3805df9453",
        date,
        totalTime,
      },
    })
      .then((res) => {
        const now = new Date();

        const updatedSlots = res.data.slots.map((slot) => {
          const slotStart = parseSlotUTCtoLocal(slot.startTime);
          // const slotDuration = slot.duration || 30; // use real slot duration
          // const slotEnd = new Date(slotStart.getTime() + slotDuration * 60000);
          const slotEnd = new Date(slotStart.getTime() + totalTime * 60000); // totalTime here
          const shopClose = new Date(slotStart);
          shopClose.setHours(20, 0, 0, 0); // 8 PM local time


          let available = slot.available;
          let reason = "";

          // Working logic (UNCHANGED)
          if (slotStart < now) {
            available = false;
            reason = "Time passed";
          } else if (slotEnd > shopClose) {
            available = false;
            reason = "Exceeds closing time";
          } else if (!slot.available) {
            available = false;
            reason = slot.reason || "Booked";
          }

          return { ...slot, available, reason };
        });

        setSlots(updatedSlots);
      })
      .catch(() => setSlots([]))
      .finally(() => setLoading(false));
  }, [date, totalTime]);

  return (
    <div>
      <h3>Select Time Slot</h3>
      {loading && <p>Loading slots...</p>}

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        {slots.map((slot) => {
          // ---------- UI-LEVEL PARTIAL RESERVATION ----------
          let isPartiallyReserved = false;

          if (selectedSlot) {
            const selStart = parseSlotUTCtoLocal(selectedSlot.startTime);
            const selEnd = new Date(selStart.getTime() + totalTime * 60000);

            const slotStart = parseSlotUTCtoLocal(slot.startTime);
            const slotDuration = slot.duration || 30; // use real slot duration
            const slotEnd = new Date(slotStart.getTime() + slotDuration * 60000);

            // Only mark as partial if slot overlaps **inside** selected slot range
            if (
              slot.reason !== "Booked" &&
              slot.startTime !== selectedSlot.startTime &&
              slotStart < selEnd &&
              slotEnd > selStart &&
              slot.startTime !== selectedSlot.startTime
            ) {
              isPartiallyReserved = true;
            }

          }
          return (
            <button
              key={slot.startTime}
              disabled={!slot.available || isPartiallyReserved}
              onClick={() => availableSlotClick(slot)}
              style={{
                padding: "10px",
                borderRadius: "6px",
                border: "none",
                cursor:
                  slot.available && !isPartiallyReserved
                    ? "pointer"
                    : "not-allowed",
                backgroundColor: isPartiallyReserved
                  ? "#fde68a"
                  : !slot.available
                  ? "#e5e7eb"
                  : selectedSlot?.startTime === slot.startTime
                  ? "#2563eb"
                  : "#3b82f6",
                color: !slot.available ? "#6b7280" : "#111827",
                minWidth: "90px",
              }}
            >
              {slot.label}

              {isPartiallyReserved && (
                <div style={{ fontSize: "10px", marginTop: "2px" }}>
                  Partial slots reserved
                </div>
              )}

              {!isPartiallyReserved && !slot.available && (
                <div style={{ fontSize: "10px", marginTop: "2px" }}>
                  {slot.reason}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  // -------------------- HANDLER --------------------
  function availableSlotClick(slot) {
    if (!slot.available) return;
    setSelectedSlot(slot);
  }
}
