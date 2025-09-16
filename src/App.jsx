import { useEffect, useState } from "react";
import { useAuth } from "./hooks/Auth";

import SessionsTab from "./components/SessionsTab";
import QuestsTab from "./components/QuestsTab";
import InfoTab from "./components/InfoTab";

import { SessionRepository } from "./repositories/SessionRepository";

// TODO: 
// - In markDone, a popup to update hoursSpent should be appear
// - show hoursSpent instead of hoursEstimate in completed quests in GoalTabs too
// - Make CRUD operations more extensive for both goals and quest:
// * others attributes e.g. possible to add deadline, start, etc. (name, hoursRange, motherItemsFks already done)
// - import quests from google calendar
// - add priority to quests and use it in sorting (e.g. high, medium, low mapped to 3,2,1)
// - When no goals/quests are being created for a category/goal respectively, show a reminder to take care of it and create a quest for it (half implemented in useItemTabManager)
// - Add color code for categories and show it in goals/quests

function App() {

  const sessionsTabName = "activity"
  const questsTabName = "quests"
  const infoTabName = "info"

  const { user, loading, signInWithGoogle, logout } = useAuth();

  const [completedSessions, setCompletedSessions] = useState([]);
  const [activeTab, setActiveTab] = useState(sessionsTabName);

  const totalXP = completedSessions.reduce((total, session) => total + session.associatedProgress, 0);
  const level = Math.floor(totalXP / 50);

  // Subscribes to real-time updates of sessions and updates the component state with the latest sessions
  useEffect(() => {
    if (!user) return;
    const unsubscribe = SessionRepository.onFieldChange("userId", user.uid, (sessions) => {
      setCompletedSessions(sessions.filter(s => s.done));
    });
    return () => unsubscribe(); // called when component unmounts and before effect re-runs
  }, [user]);
  
  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: "2rem"}}>
      {!user ?
        <div className="center-screen">
          <button onClick={signInWithGoogle}>Sign In With Google</button>
        </div>
        : (
          <>
          <div style={{ display: "flex", 
            justifyContent: "flex-end", 
            alignItems: "center", 
            gap: "1rem"
          }}>
            <p style={{ margin: 0 }}>Welcome {user.firstName || user.email}</p>
            <button onClick={logout}>Logout</button>
          </div>

          <h1>OrGamization App</h1>

          <div style={{ textAlign: "center", margin: "3rem 0 4rem"}}>
            <p>Level: {level} | XP: {totalXP}</p>
            <progress
              value={totalXP % 50}
              max="50"
              style={{ display: "block", margin: "0 auto", width: "380px"}}
            />
          </div>
          <div className="tab-buttons">
            {[sessionsTabName, questsTabName, infoTabName].map((tabName) => (
              <button
                key={tabName}
                className={activeTab === tabName ? "active" : ""}
                onClick={() => setActiveTab(tabName)}
              >
                {tabName.charAt(0).toUpperCase() + tabName.slice(1)}
              </button>
            ))}
          </div>

          <div style={{ marginTop: "1rem" }}>
            {activeTab === sessionsTabName && (
              <SessionsTab
                user={user}
              />
            )}
            {activeTab === questsTabName && (
              <QuestsTab
                user={user}
              />
            )}
            {activeTab === infoTabName && (
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
