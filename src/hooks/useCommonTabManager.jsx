import { useCallback, useEffect, useState } from "react";
import { format, isSameDay, isSameMonth, isSameYear } from "date-fns";

export default function useCommonTabManager({ changeStatus, remove }) {

  // Card buttons component
  const renderCardButtons = useCallback(
      (item, { isFormOpen, setFormItem }) => (
      <div className="card-buttons">
         <button
            className="card-button done"
            onClick={(e) => {
            e.stopPropagation();
            changeStatus(item);
            }}
         >
            {item.isDone ? "Revert" : "Done"}
         </button>
         <button
            className="card-button delete"
            onClick={(e) => {
            e.stopPropagation();
            remove(item.id);
            }}
         >
            Delete
         </button>
         {!isFormOpen && (
            <button
            className="card-button edit"
            onClick={(e) => {
               e.stopPropagation();
               setFormItem(item);
            }}
            >
            Edit
            </button>
         )}
      </div>
      ),
      [changeStatus, remove]
   );

   /* -------- DATE HELPERS -------- */
   function SessionCountdown({ start, end }) {
      // Create a component that updates the current time every second
      const [now, setNow] = useState(new Date());
      useEffect(() => {
         const id = setInterval(() => setNow(new Date()), 1000);
         return () => clearInterval(id);
      }, []);
      
      if (!start || !end) return <>No time range</>;
      else if (now < start) return <>starts in {formatDuration(start - now)}</>;
      else if (now < end) return <>ends in {formatDuration(end - now)}</>;
      else return <>Expired</>;
   }

   function Countdown({ deadline }) {
      const [now, setNow] = useState(new Date());
      useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
      }, []);

      if (!deadline) return <>No deadline</>;

      const diffMs = new Date(deadline) - now;
      if (diffMs <= 0) return <>Expired</>;

      return <>ends in {formatDuration(diffMs)}</>;
   }

   function formatDuration(diffMs) {
      const totalSeconds = Math.floor(diffMs / 1000);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
    
      if (days > 0) return `${days}d ${hours}h`;
      else if (hours > 0) return `${hours}h ${minutes}m`;
      else if (minutes > 0) return `${minutes}m ${seconds}s`;
      else return `${seconds}s`;
    }

   function toDateTimeLocalString(date) {
      if (!date) return "";
      const pad = (n) => String(n).padStart(2, "0");
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
   }

   function formatDate(date) {
      if (!date) return "";
      const d = new Date(date);
      const now = new Date();

      const showYear = d.getFullYear() !== now.getFullYear();
      const fmt = `d MMM${showYear ? " yyyy" : ""} HH:mm`;

      return format(d, fmt);
   }

   
  function formatDateRange(start, end) {
   if (!start || !end) return "";
 
   const s = new Date(start);
   const e = new Date(end);
   const now = new Date();
 
   const showYearStart = s.getFullYear() !== now.getFullYear();
   const showYearEnd = e.getFullYear() !== now.getFullYear();
 
   if (isSameDay(s, e)) {
     // same day → show full date once, then only time for end
     const fmt = `d MMM${showYearStart ? " yyyy" : ""} HH:mm`;
     return `${format(s, fmt)} - ${format(e, "HH:mm")}`;
   }
 
   if (isSameMonth(s, e)) {
     // same month → repeat day + time, year only if different from current
     const fmtStart = `d MMM${showYearStart ? " yyyy" : ""} HH:mm`;
     return `${format(s, fmtStart)} - ${format(e, "d HH:mm")}`;
   }
 
   if (isSameYear(s, e)) {
     // same year, different month
     const fmtStart = `d MMM${showYearStart ? " yyyy" : ""} HH:mm`;
     return `${format(s, fmtStart)} - ${format(e, "d MMM HH:mm")}`;
   }
 
   // different years
   return `${format(s, "d MMM yyyy HH:mm")} - ${format(e, "d MMM yyyy HH:mm")}`;
 }

  return {
      renderCardButtons,
      Countdown,
      SessionCountdown,
      formatDate,
      toDateTimeLocalString,
      formatDateRange 
   };
}
