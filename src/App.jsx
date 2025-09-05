import { useEffect, useState } from "react";
import './App.css';
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "./config/firebase-config";
import { Auth } from "./components/Auth";
import { signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import QuestsTab from "./components/QuestsTab";
import GoalsTab from "./components/GoalsTab";
import { collectionName as userQuestsCollectionName } from "./services/questService";

function App() {
  const [user, loading] = useAuthState(auth);
  const [pendingQuests, setPendingQuests] = useState([]);
  const [completedQuests, setCompletedQuests] = useState([]);
  const [activeTab, setActiveTab] = useState("quests");

  const totalXP = completedQuests.reduce((a, q) => a + q.xp, 0);
  const level = Math.floor(totalXP / 50) + 1;

  // Load quests from Firestore
  useEffect(() => {
    if (!user) return;
    const ref = doc(db, userQuestsCollectionName, user.uid);

    (async () => {
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const allQuests = snap.data().quests;
        setPendingQuests(allQuests.filter(q => !q.done));
        setCompletedQuests(allQuests.filter(q => q.done));
      } else {
        const initialQuests = [{ id: 1, name: "Building this app", xp: 10, done: false }];
        await setDoc(ref, { quests: initialQuests });
        setPendingQuests(initialQuests);
        setCompletedQuests([]);
      }
    })();
  }, [user]);

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      {!user ? <Auth /> : (
        <>
          <h1>OrGamization: Gamifying Organization</h1>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <p style={{ margin: 0 }}>Welcome {user.displayName || user.email}</p>
            <button onClick={() => signOut(auth)}>Logout</button>
          </div>

          <p>Level: {level} | XP: {totalXP}</p>
          <progress value={totalXP % 50} max="50" style={{ width: "100%" }} />


          <div className="tab-buttons">
            <button
              className={activeTab === "quests" ? "active" : ""}
              onClick={() => setActiveTab("quests")}
            >
              Quests
            </button>
            <button
              className={activeTab === "goals" ? "active" : ""}
              onClick={() => setActiveTab("goals")}
            >
              Goals
            </button>
          </div>

          <div style={{ marginTop: "1rem" }}>
            {activeTab === "quests" && (
              <QuestsTab
                db={db}
                user={user}
                pendingQuests={pendingQuests}
                setPendingQuests={setPendingQuests}
                completedQuests={completedQuests}
                setCompletedQuests={setCompletedQuests}
              />
            )}
            {activeTab === "goals" && <GoalsTab />}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
