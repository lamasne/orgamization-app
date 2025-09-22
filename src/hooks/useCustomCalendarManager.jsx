import { useState } from "react";
import useCommonTabManager from "./useCommonTabManager";

export default function useCalendarTabManager() {
  const [newStart, setNewStart] = useState(null);
  const [sessions, setSessions] = useState([]);

  const manager = useCommonTabManager();

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

    if (!newStart) {
      setNewStart(clickedTime);
    } else {
      const start = newStart < clickedTime ? newStart : clickedTime;
      const end = newStart < clickedTime ? clickedTime : newStart;

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
    const top = session.start.getHours() * 40;
    const height = (session.end - session.start) / (1000 * 60 * 60) * 40;
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
    handleClick,
    renderSession,
    ...manager,
  };
}
