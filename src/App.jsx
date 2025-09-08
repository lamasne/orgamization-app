import { useEffect, useState } from "react";
import './App.css';
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "./config/firebase-config";
import { Auth } from "./components/Auth";
import { signOut } from "firebase/auth";
import QuestsTab from "./components/QuestsTab";
import GoalsTab from "./components/GoalsTab";
import InfoTab from "./components/InfoTab";
import { QuestRepository } from "./repositories/QuestRepository";

// TODO: 
// - In markDone, a popup to update hoursSpent should be appear
// - show hoursSpent instead of hoursEstimate in completed quests in GoalTabs too
// - Make CRUD operations more extensive for both goals and quest:
// * others attributes e.g. possible to add deadline, start, link goals to categories, etc.
// - import quests from google calendar
// - add priority to quests and use it in sorting (e.g. high, medium, low mapped to 3,2,1)
// - When no goals/quests are being created for a category/goal respectively, show a reminder to take care of it and create a quest for it
// - Add color code for categories and show it in goals/quests

function App() {
  const [user, loading] = useAuthState(auth);
  const [pendingQuests, setPendingQuests] = useState([]);
  const [completedQuests, setCompletedQuests] = useState([]);
  const [activeTab, setActiveTab] = useState("quests");

  const totalXP = completedQuests.reduce((a, q) => a + q.hoursSpent, 0);
  const level = Math.floor(totalXP / 50) + 1;

  const loadQuests = async () => {
    if (!user) return;
    const allQuests = await QuestRepository.findByUserId(user.uid);
    setPendingQuests(allQuests.filter(q => !q.done));
    setCompletedQuests(allQuests.filter(q => q.done));
  };

  useEffect(() => {
    loadQuests();
  }, [db, user]);
  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      {!user ? <Auth /> : (
        <>
          <h1>OrGamization App</h1>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <p style={{ margin: 0 }}>Welcome {user.displayName || user.email}</p>
            <button onClick={() => signOut(auth)}>Logout</button>
          </div>

          <p>Level: {level} | XP: {totalXP}</p>
          <progress value={totalXP % 50} max="50" style={{ width: "100%" }} />


          <div className="tab-buttons">
            <button
              className={activeTab === "quests" ? "active" : ""}
              onClick={() => {
                setActiveTab("quests");
                loadQuests(); // refresh quests when switching to this tab
              }}
            >
              Quests
            </button>
            <button
              className={activeTab === "goals" ? "active" : ""}
              onClick={() => setActiveTab("goals")}
            >
              Goals
            </button>
            <button
              className={activeTab === "info" ? "active" : ""}
              onClick={() => setActiveTab("info")}
            >
              Info
            </button>
          </div>

          <div style={{ marginTop: "1rem" }}>
            {activeTab === "quests" && (
              <QuestsTab
                user={user}
                pendingQuests={pendingQuests}
                setPendingQuests={setPendingQuests}
                completedQuests={completedQuests}
                setCompletedQuests={setCompletedQuests}
                activeTab={activeTab}
              />
            )}
            {activeTab === "goals" && (
              <GoalsTab
                db={db}
                user={user}
                activeTab={activeTab}
              />
            )}
            {activeTab === "info" && (
              <div style={{ textAlign: "left" }}>
                <InfoTab />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
