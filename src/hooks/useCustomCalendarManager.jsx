import { useState } from "react";
import useCommonTabManager from "./useCommonTabManager";

export default function useCalendarTabManager() {
  const [newStart, setNewStart] = useState(null);
  const [sessions, setSessions] = useState([]);

  const manager = useCommonTabManager();

  const hourHeight = parseInt(getComputedStyle(document.documentElement)
  .getPropertyValue("--hour-slot-height"), 10);


  // build the 3 days: today + 1 + 2
  const days = [...Array(3)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const handleTimeClick = (day, e) => {
    const gridTop = e.currentTarget.getBoundingClientRect().top; // get the top of the grid
    const y = e.clientY - gridTop; // get the y position of the click
    
    // Get date+time and round to the nearest 15 minutes
    const slotMinutes = 15; // step size

    const totalMinutes = y / hourHeight * 60; // clicked time in minutes, e.g. 13.75h → 825 min
    const roundedMinutes = Math.round(totalMinutes / slotMinutes) * slotMinutes;

    const hour = Math.floor(roundedMinutes / 60);
    const minute = roundedMinutes % 60;

    const clickedDate = new Date(day);
    clickedDate.setHours(hour, minute, 0, 0);

    if (!newStart) {
      setNewStart(clickedDate);
    } else {
      // if the new start is before the clicked time, set the new start to the clicked time
      const start = newStart < clickedDate ? newStart : clickedDate;
      const end = newStart < clickedDate ? clickedDate : newStart;
  
      const newSession = {
        id: crypto.randomUUID(),
        name: "New Session",
        start,
        end,
      };
  
      setSessions((prev) => [...prev, newSession]);
      setNewStart(null);
    }
  };
  

  const renderSession = (session) => {
    const startMinutes = session.start.getHours() * 60 + session.start.getMinutes();
    const endMinutes = session.end.getHours() * 60 + session.end.getMinutes();
  
    const top = (startMinutes / 60) * hourHeight; 
    const height = ((endMinutes - startMinutes) / 60) * hourHeight;

    return (
      <div
        key={session.id}
        className="calendar-session"
        style={{ top, height }}
      >
        {session.name}
      </div>
    );
  };


  return {
    days,
    sessions,
    handleTimeClick,
    renderSession,
    hourHeight,
    ...manager,
  };
}
