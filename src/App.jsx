import { useEffect, useState } from "react";
import './App.css';
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "./config/firebase-config";
import { Auth } from "./components/Auth";
import { signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import QuestsTab from "./components/QuestsTab";
import GoalsTab from "./components/GoalsTab";

function App() {
  const [user, loading] = useAuthState(auth);
  const [pendingQuests, setPendingQuests] = useState([]);
  const [completedQuests, setCompletedQuests] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [editingQuest, setEditingQuest] = useState(null);
  const [editName, setEditName] = useState("");
  const [editXP, setEditXP] = useState(0);
  const [activeTab, setActiveTab] = useState("quests");

  const totalXP = completedQuests.reduce((a, q) => a + q.xp, 0);
  const level = Math.floor(totalXP / 50) + 1;


  
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  if (!apiKey) {
    console.error("VITE_FIREBASE_API_KEY is missing!");
  } else {
    console.log("Firebase API key is present: ..." + apiKey.slice(-2));
  }




  // Load quests from Firestore
  useEffect(() => {
    if (!user) return;
    const ref = doc(db, "userQuests", user.uid);

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

  // Firestore save
  const saveQuests = async (allQuests) => {
    if (!user) return;
    const ref = doc(db, "userQuests", user.uid);
    await setDoc(ref, { quests: allQuests });
  };

  // Quest functions
  const markDone = async (id) => {
    const updatedPending = pendingQuests.filter(q => q.id !== id);
    const doneQuest = pendingQuests.find(q => q.id === id);
    const updatedCompleted = [...completedQuests, { ...doneQuest, done: true }];
    await saveQuests([...updatedPending, ...updatedCompleted]);
    setPendingQuests(updatedPending);
    setCompletedQuests(updatedCompleted);
  };

  const revertQuest = async (id) => {
    const updatedCompleted = completedQuests.filter(q => q.id !== id);
    const revertedQuest = completedQuests.find(q => q.id === id);
    const updatedPending = [...pendingQuests, { ...revertedQuest, done: false }];
    await saveQuests([...updatedPending, ...updatedCompleted]);
    setPendingQuests(updatedPending);
    setCompletedQuests(updatedCompleted);
  };

  const deleteQuest = async (id) => {
    if (!window.confirm("Are you sure? This action is irreversible.")) return;
    const updatedPending = pendingQuests.filter(q => q.id !== id);
    const updatedCompleted = completedQuests.filter(q => q.id !== id);
    await saveQuests([...updatedPending, ...updatedCompleted]);
    setPendingQuests(updatedPending);
    setCompletedQuests(updatedCompleted);
  };

  const addQuest = async (e, name, xp) => {
    e.preventDefault();
    const newQuest = { id: Date.now(), name, xp: Number(xp), done: false };
    const allQuests = [...pendingQuests, newQuest, ...completedQuests];
    await saveQuests(allQuests);
    setPendingQuests([...pendingQuests, newQuest]);
    setShowForm(false);
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    const updatedQuest = { ...editingQuest, name: editName, xp: Number(editXP) };
    const allQuests = [...pendingQuests, ...completedQuests].map(q =>
      q.id === editingQuest.id ? updatedQuest : q
    );
    await saveQuests(allQuests);
    setPendingQuests(allQuests.filter(q => !q.done));
    setCompletedQuests(allQuests.filter(q => q.done));
    setEditingQuest(null);
  };

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
                pendingQuests={pendingQuests}
                completedQuests={completedQuests}
                markDone={markDone}
                revertQuest={revertQuest}
                deleteQuest={deleteQuest}
                addQuest={addQuest}
                showForm={showForm}
                setShowForm={setShowForm}
                editingQuest={editingQuest}
                setEditingQuest={setEditingQuest}
                editName={editName}
                setEditName={setEditName}
                editXP={editXP}
                setEditXP={setEditXP}
                handleEditSave={handleEditSave}
                showCompleted={showCompleted}
                setShowCompleted={setShowCompleted}
                totalXP={totalXP}
                level={level}
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
