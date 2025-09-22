
import { useCallback, useRef, useState } from "react";
import { GoogleAuthProvider, reauthenticateWithPopup } from "firebase/auth";
import { getAuth } from "firebase/auth";

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
      // ✅ reuse token if it expires in >1min
      return cachedToken.current;
    }

    const provider = new GoogleAuthProvider();
    provider.addScope("https://www.googleapis.com/auth/calendar.readonly");

    // fallback: force reauth to refresh token
    const result = await reauthenticateWithPopup(user, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);

    if (!credential?.accessToken) {
      throw new Error("Failed to obtain Google access token");
    }

    // Google tokens normally last 1 hour
    cachedToken.current = credential.accessToken;
    cachedExpiry.current = now + 55 * 60 * 1000; // assume ~55min safe window

    return cachedToken.current;
  }, [auth]);


  async function fetchEvents() {
    try {
      const token = await getToken();

      const url =
      "https://www.googleapis.com/calendar/v3/calendars/primary/events" +
      `?timeMin=${new Date().toISOString()}` +
      "&maxResults=5&singleEvents=true&orderBy=startTime";
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Google API error " + res.status);

      setGoogleEvents((await res.json()).items || []);
    } catch (err) {
      console.error(err);
    }
  }

  return { googleEvents, fetchEvents };
}
