import { useCallback, useRef, useState } from "react";
import { GoogleAuthProvider, reauthenticateWithPopup, getAuth } from "firebase/auth";
import { Session } from "../models/Session";

export default function useGoogleCalendarManager() {
  const [googleEvents, setGoogleEvents] = useState([]);

  const auth = getAuth();
  const cachedToken = useRef(null);
  const cachedExpiry = useRef(null);

  const getToken = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) throw new Error("No signed-in user");

    const now = Date.now();
    if (cachedToken.current && cachedExpiry.current > now + 60_000) {
      // ✅ reuse token if it expires in >1min (i.e. 55min safe window)
      return cachedToken.current;
    }

    const provider = new GoogleAuthProvider();
    provider.addScope("https://www.googleapis.com/auth/calendar.events");

    // fallback: force reauth to refresh token
    const result = await reauthenticateWithPopup(user, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);

    if (!credential?.accessToken) {
      throw new Error("Failed to obtain Google access token");
    }

    cachedToken.current = credential.accessToken;
    cachedExpiry.current = now + 55 * 60 * 1000;
    return cachedToken.current;
  }, [auth]);

  // Google → Session
  function mapGoogleEventToSession(ev, userId) {
    return new Session({
      id: crypto.randomUUID(),
      userId,
      name: ev.summary || "(No title)",
      motherQuestsFks: [],
      start: ev.start.dateTime || ev.start.date,
      end: ev.end.dateTime || ev.end.date,
      comment:
        "Imported from Google Calendar" +
        (ev.description ? " - " + ev.description : ""),
      googleEventId: ev.id,
      source: "google",
    });
  }

  // Session → Google event
  function mapSessionToGoogleEvent(session) {
    const start = session.start ? new Date(session.start) : null;
    const end   = session.end   ? new Date(session.end)   : null;
  
    if (!start || !end || isNaN(start) || isNaN(end)) {
      throw new Error("Session has invalid start/end");
    }
  
    return {
      summary: session.name,
      description: "Created from app",
      start: {
        dateTime: start.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: end.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    };
  }

  async function fetchNextEvents(numberEvents) {
    try {
      const token = await getToken();
      const url =
        "https://www.googleapis.com/calendar/v3/calendars/primary/events" +
        `?timeMin=${new Date().toISOString()}` +
        `&maxResults=${numberEvents}&singleEvents=true&orderBy=startTime`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Google API error " + res.status);

      const data = await res.json();
      const mapped = (data.items || []).map((ev) =>
        mapGoogleEventToSession(ev, auth.currentUser.uid)
      );

      setGoogleEvents(mapped);
    } catch (err) {
      console.error(err);
    }
  }

  async function createEvent(session) {
    try {
      const token = await getToken();
      const event = mapSessionToGoogleEvent(session);

      console.log("Creating Google event:", JSON.stringify(event, null, 2));


      const res = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(event),
        }
      );
      if (!res.ok) throw new Error("Google API error " + res.status);
      return await res.json();
    } catch (err) {
      console.error("Failed to create Google Calendar event:", err);
    }
  }

  return { googleEvents, fetchNextEvents, createEvent };
}
