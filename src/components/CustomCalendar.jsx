import React from "react";
import useCalendarTabManager from "../hooks/useCustomCalendarManager";
import "./CustomCalendar.css";

export default function CustomCalendar() {
  const manager = useCalendarTabManager();

  const renderDaySchedule = (day, dayIdx) => (
    <div key={dayIdx} className="calendar-day">
      <h4 className="calendar-day-title">{manager.formatDate(day)}</h4>

      <div className="calendar-grid">
        {[...Array(24)].map((_, h) => (
          <div
            key={h}
            className="calendar-hour"
            onClick={() => manager.handleClick(day, h)}
          >
            {`${h}:00`}
          </div>
        ))}

        {manager.sessions
          .filter((s) => s.start.toDateString() === day.toDateString())
          .map((s) => manager.renderSession(s))}
      </div>
    </div>
  );

  return <div className="calendar-container">{manager.days.map(renderDaySchedule)}</div>;
}
