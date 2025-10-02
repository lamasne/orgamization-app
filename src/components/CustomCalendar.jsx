import React from "react";
import useCalendarTabManager from "../hooks/useCustomCalendarManager";
import "./CustomCalendar.css";

export default function CustomCalendar() {
  const manager = useCalendarTabManager();

  const renderDaySchedule = (day, dayIdx) => (
    <div key={dayIdx} className="calendar-day">
      <h4 className="calendar-day-title">
        {day.toLocaleDateString("en-US", { weekday: "short" })} · {manager.formatDate(day)}
      </h4>

      <div className="calendar-grid" onClick={(e) => manager.handleTimeClick(day, e)}>
        {[...Array(24)].map((_, h) => (
          <div
            key={h}
            className="calendar-hour-tick"
            style={{ top: h * manager.hourHeight }}
          >
            <span className="hour-label">{`${h}`}</span>
          </div>
        ))}

        {manager.sessions
          .filter((s) => s.start.toDateString() === day.toDateString())
          .map(manager.renderSession)}
      </div>
    </div>
  );

  return <div className="calendar-container">{manager.days.map(renderDaySchedule)}</div>;
}
