import React, { useState } from "react";

// helper: round to nearest 30 min
function roundTo30min(date) {
  const d = new Date(date);
  d.setMinutes(Math.floor(d.getMinutes() / 30) * 30, 0, 0);
  return d;
}

export default function Calendar3Day() {
  const [pendingStart, setPendingStart] = useState(null);
  const [sessions, setSessions] = useState([]);

  // build the 3 days: today + 1 + 2
  const days = [...Array(3)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const handleClick = (day, hour) => {
    const clickedTime = new Date(day);
    clickedTime.setHours(hour, 0, 0, 0);
    const time = roundTo30min(clickedTime);

    if (!pendingStart) {
      setPendingStart(time);
    } else {
      const start = pendingStart < time ? pendingStart : time;
      const end = pendingStart < time ? time : pendingStart;

      const newSession = {
        id: crypto.randomUUID(),
        name: "New Session",
        status: "pending",
        start,
        end,
      };

      setSessions((prev) => [...prev, newSession]);
      setPendingStart(null);
    }
  };

  return (
    <div style={{ display: "flex", gap: "1rem" }}>
      {days.map((day, dayIdx) => (
        <div key={dayIdx} style={{ flex: 1, border: "1px solid #ccc" }}>
          <h4>{day.toDateString()}</h4>
          <div style={{ position: "relative" }}>
            {[...Array(24)].map((_, h) => (
              <div
                key={h}
                style={{
                  height: "40px",
                  borderTop: "1px solid #eee",
                  cursor: "pointer",
                }}
                onClick={() => handleClick(day, h)}
              >
                {h}:00
              </div>
            ))}

            {/* render sessions */}
            {sessions
              .filter(
                (s) =>
                  s.start.toDateString() === day.toDateString()
              )
              .map((s) => {
                const top = s.start.getHours() * 40;
                const height = (s.end - s.start) / (1000 * 60 * 60) * 40;
                return (
                  <div
                    key={s.id}
                    style={{
                      position: "absolute",
                      top,
                      left: "5%",
                      width: "90%",
                      height,
                      background: "rgba(100, 150, 255, 0.6)",
                      border: "1px solid #3366ff",
                      borderRadius: "6px",
                      pointerEvents: "none",
                    }}
                  >
                    {s.name}
                  </div>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}
