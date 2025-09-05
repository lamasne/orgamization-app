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
  const [showCompleted, setShowCompleted] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskXP, setNewTaskXP] = useState(0);
  const [editingQuest, setEditingQuest] = useState(null);
  const [editName, setEditName] = useState("");
  const [editXP, setEditXP] = useState(0);

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

  const deleteQuest = async (id, fromCompleted = false) => {
    if (!window.confirm("Are you sure? This action is irreversible.")) return;

    const updatedPending = pendingQuests.filter(q => q.id !== id);
    const updatedCompleted = completedQuests.filter(q => q.id !== id);

    await saveQuests([...updatedPending, ...updatedCompleted]);

    setPendingQuests(updatedPending);
    setCompletedQuests(updatedCompleted);
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

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <p style={{ margin: 0 }}>Welcome {user.displayName || user.email}</p>
            <button onClick={() => signOut(auth)}>Logout</button>
          </div>

          <p>Level: {level} | XP: {totalXP}</p>
          <progress value={totalXP % 50} max="50" style={{ width: "100%" }} />

          <h2>Pending Tasks</h2>
          <ul>
            {pendingQuests.map(q => (
              <li key={q.id}>
                {q.name} (+{q.xp} XP)
                <button style={{ marginLeft: "1rem" }} onClick={() => markDone(q.id)}>
                  Done
                </button>
                <button style={{ marginLeft: "0.5rem", color: "red" }} onClick={() => deleteQuest(q.id)}>
                  Delete
                </button>
                <button style={{ marginLeft: "0.5rem" }} onClick={() => {
                  setEditingQuest(q);
                  setEditName(q.name);
                  setEditXP(q.xp);
                }}>
                  Edit
                </button>
              </li>
            ))}
          </ul>

          {editingQuest && (
            <form onSubmit={handleEditSave} style={{ marginTop: "1rem" }}>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
              <input
                type="number"
                value={editXP}
                onChange={(e) => setEditXP(e.target.value)}
                required
                style={{ width: "60px", marginLeft: "0.5rem" }}
              />
              <button type="submit" style={{ marginLeft: "0.5rem" }}>Save</button>
              <button
                type="button"
                style={{ marginLeft: "0.5rem" }}
                onClick={() => setEditingQuest(null)}
              >
                Cancel
              </button>
            </form>
          )}


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

          <button style={{ marginTop: "1rem" }} onClick={() => setShowCompleted(!showCompleted)}>
            {showCompleted ? "Hide Completed Tasks" : "See Completed Tasks"}
          </button>

          {showCompleted && (
            <>
              <h2>Completed Tasks</h2>
              <ul>
                {completedQuests.map(q => (
                  <li key={q.id}>
                    {q.name} (+{q.xp} XP)
                    <button style={{ marginLeft: "1rem" }} onClick={() => revertQuest(q.id)}>
                      Revert
                    </button>
                    <button style={{ marginLeft: "0.5rem", color: "red" }} onClick={() => deleteQuest(q.id, true)}>
                      Delete
                    </button>
                    <button style={{ marginLeft: "0.5rem" }} onClick={() => {
                      setEditingQuest(q);
                      setEditName(q.name);
                      setEditXP(q.xp);
                    }}>
                      Edit
                    </button>                    
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default App;
