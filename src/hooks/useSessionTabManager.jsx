import { useEffect, useState } from "react";
import useCommonTabManager from "./useCommonTabManager";
import { SessionRepository } from "../repositories/SessionRepository";
import { QuestRepository } from "../repositories/QuestRepository";
import { getAuth } from "firebase/auth";

export default function useSessionTabManager() {
  const auth = getAuth();
  const user = auth.currentUser;

  const [pendingSessions, setPendingSessions] = useState([]);
  const [completedSessions, setCompletedSessions] = useState([]);
  const [allMotherQuestsMap, setAllMotherQuestsMap] = useState({});
  
  useEffect(() => {
    if (!user) return;
    const unsubscribe = SessionRepository.onFieldChange("userId", user.uid, (sessions) => {
      setPendingSessions(sessions.filter(s => !s.isDone));
      setCompletedSessions(sessions.filter(s => s.isDone));
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    let unsubscribe = () => {};
  
    const updateMotherQuestsMap = (sessions) => {
      const updatedMap = { ...allMotherQuestsMap };
      sessions.forEach(s => { updatedMap[s.id] = s; });
      setAllMotherQuestsMap(updatedMap);
    };

    unsubscribe = QuestRepository.onFieldChange("userId", user.uid, (sessions) => {
      updateMotherQuestsMap(sessions);
    });
  
    return () => unsubscribe();
  }, [user]);


  const changeStatus = async (session) => {
    console.log("Request to change status of session", session, "by user", user.uid);
    const updated = { 
      ...session, 
      status: session.isDone ? "pending" : "completed",
      associatedProgress: session.associatedProgress,
    };
    await SessionRepository.save(user.uid, updated);
  };

  const remove = async (id) => {
    if (!window.confirm("Are you sure? This action is irreversible.")) return;
    await SessionRepository.deleteMany(user.uid, [id]);
  };

  const common = useCommonTabManager({ changeStatus, remove });

  return {
    pendingSessions,
    completedSessions,
    allMotherQuestsMap,
    changeStatus,
    remove,
    ...common,
  };
}