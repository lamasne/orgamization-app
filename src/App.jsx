import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "./config/firebase-config";
import { Auth } from "./components/auth";
import { signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

function App() {
  const [user, loading] = useAuthState(auth);
  const [pendingQuests, setPendingQuests] = useState([]);
  const [completedQuests, setCompletedQuests] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskXP, setNewTaskXP] = useState(0);

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
        const initialQuests = [
          { id: 1, name: "Building this app", xp: 10, done: false },
        ];
        await setDoc(ref, { quests: initialQuests });
        setPendingQuests(initialQuests);
        setCompletedQuests([]);
      }
    })();
  }, [user]);

  const saveQuests = async (allQuests) => {
    if (!user) return;
    const ref = doc(db, "userQuests", user.uid);
    await setDoc(ref, { quests: allQuests });
  };

  const markDone = async (id) => {
    const updatedPending = pendingQuests.map(q => q.id === id ? { ...q, done: true } : q);
    const doneQuest = updatedPending.find(q => q.id === id);
    const allQuests = [...updatedPending, ...completedQuests];

    await saveQuests(allQuests);

    setPendingQuests(updatedPending.filter(q => !q.done));
    setCompletedQuests([...completedQuests, doneQuest]);
  };

  const addTask = async (e) => {
    e.preventDefault();
    const newQuest = {
      id: Date.now(),
      name: newTaskName,
      xp: Number(newTaskXP),
      done: false,
    };
    const allQuests = [...pendingQuests, newQuest, ...completedQuests];
    await saveQuests(allQuests);
    setPendingQuests([...pendingQuests, newQuest]);
    setShowForm(false);
    setNewTaskName("");
    setNewTaskXP(0);
  };

  const totalXP = completedQuests.reduce((a, q) => a + q.xp, 0);
  const level = Math.floor(totalXP / 50) + 1;

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      {!user ? (
        <Auth />
      ) : (
        <>
          <h1>Quant Prep XP Tracker</h1>
          <p>Welcome {user.displayName || user.email}</p>
          <p>Level: {level} | XP: {totalXP}</p>
          <progress value={totalXP % 50} max="50" style={{ width: "100%" }} />

          <ul>
            {pendingQuests.map(q => (
              <li key={q.id}>
                <label>
                  {q.name} (+{q.xp} XP)
                  <button style={{ marginLeft: "1rem" }} onClick={() => markDone(q.id)}>
                    Done
                  </button>
                </label>
              </li>
            ))}
          </ul>

          {!showForm && (
            <button onClick={() => setShowForm(true)}>+ Add Task</button>
          )}

          {showForm && (
            <form onSubmit={addTask} style={{ marginTop: "1rem" }}>
              <input
                type="text"
                placeholder="Task name"
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
                required
              />
              <input
                type="number"
                placeholder="XP"
                value={newTaskXP}
                onChange={(e) => setNewTaskXP(e.target.value)}
                required
                style={{ width: "60px", marginLeft: "0.5rem" }}
              />
              <button type="submit" style={{ marginLeft: "0.5rem" }}>Add</button>
              <button type="button" style={{ marginLeft: "0.5rem" }} onClick={() => setShowForm(false)}>Cancel</button>
            </form>
          )}

          <button style={{ marginTop: "1rem" }} onClick={() => signOut(auth)}>Logout</button>
        </>
      )}
    </div>
  );
}

export default App;
