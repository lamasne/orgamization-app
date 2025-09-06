import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { createGoalDTO } from "../DTOs/GoalDTO";
import { createQuestDTO } from "../DTOs/QuestDTO";
import { saveGoal, deleteGoals } from "../services/goalService";
import { saveQuest } from "../services/questService";

export default function GoalsTab({ db, user, activeTab }) {
  const [pendingGoals, setPendingGoals] = useState([]);
  const [completedGoals, setCompletedGoals] = useState([]);
  const [isEditingGoal, setIsEditingGoal] = useState([false, null]);
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [isShowCompletedGoals, setIsShowCompletedGoals] = useState(false);

  const [newName, setNewName] = useState("");
  const [newHoursEstimate, setNewHoursEstimate] = useState(0);

  // Load all goals for the current user
  const loadGoals = async () => {
    if (!user) return;
    const q = query(
      collection(db, "goals"),
      where("userId", "==", user.uid)
    );
    const querySnap = await getDocs(q);
    const allGoals = querySnap.docs.map((d) => d.data());
    setPendingGoals(allGoals.filter((g) => !g.done));
    setCompletedGoals(allGoals.filter((g) => g.done));
  };

  // load on mount and whenever user/db init or changes
  useEffect(() => {
    loadGoals();
  }, [db, user]);

  // additionally, reload whenever the Goals tab becomes active
  useEffect(() => {
    if (activeTab === "goals") {
      loadGoals();
    }
  }, [activeTab]);

  const markDone = async (id) => {
    const goal = pendingGoals.find((g) => g.id === id);
    if (!goal) return;
    const updated = { ...goal, done: true };
    await saveGoal(user.uid, updated);
    setPendingGoals(pendingGoals.filter((g) => g.id !== id));
    setCompletedGoals([...completedGoals, updated]);
  };

  const revertGoal = async (id) => {
    const goal = completedGoals.find((g) => g.id === id);
    if (!goal) return;
    const updated = { ...goal, done: false };
    await saveGoal(user.uid, updated);
    setCompletedGoals(completedGoals.filter((g) => g.id !== id));
    setPendingGoals([...pendingGoals, updated]);
  };

  const removeGoal = async (id) => {
    if (!window.confirm("Are you sure? This action is irreversible.")) return;
    console.log("Deleting goal with id:", id);
    await deleteGoals(user.uid, [id]);
    setPendingGoals(pendingGoals.filter((g) => g.id !== id));
    setCompletedGoals(completedGoals.filter((g) => g.id !== id));
  };

  const addGoal = async (e) => {
    e.preventDefault();
    const newGoal = createGoalDTO({
      userId: user.uid,
      name: newName,
      hoursEstimate: Number(newHoursEstimate),
    });

    // Create default task if none exists
    if (!newGoal.tasksCoverFKs || newGoal.tasksCoverFKs.length === 0) {
      const defaultTask = createQuestDTO({
        userId: user.uid,
        name: `Define a cover of tasks for goal: ${newName}`,
        hoursEstimate: 1,
      });
      await saveQuest(user.uid, defaultTask);
      newGoal.tasksCoverFKs = [defaultTask.id];
    }

    await saveGoal(user.uid, newGoal);
    setPendingGoals([...pendingGoals, newGoal]);
    setNewName("");
    setNewHoursEstimate(0);
    setIsAddingGoal(false);
  };

  const editGoal = async (e) => {
    e.preventDefault();
    const goal = [...pendingGoals, ...completedGoals].find(
      (g) => g.id === isEditingGoal[1]
    );
    if (!goal) return;

    const updatedGoal = {
      ...goal,
      name: newName,
      hoursEstimate: Number(newHoursEstimate),
    };
    await saveGoal(user.uid, updatedGoal);

    const allGoals = [...pendingGoals, ...completedGoals].map((g) =>
      g.id === updatedGoal.id ? updatedGoal : g
    );
    setPendingGoals(allGoals.filter((g) => !g.done));
    setCompletedGoals(allGoals.filter((g) => g.done));
    setIsEditingGoal([false, null]);
    setNewName("");
    setNewHoursEstimate(0);
  };

  return (
    <>
      <h2>Pending Goals</h2>
      {pendingGoals.length === 0 && <p>No pending goals. Add your next goal!</p>}
      <ul>
        {pendingGoals.map((g) => (
          <li key={g.id}>
            {g.name} ({g.hoursEstimate} hours)
            <button style={{ marginLeft: "1rem" }} onClick={() => markDone(g.id)}>Done</button>
            <button style={{ marginLeft: "0.5rem", color: "red" }} onClick={() => removeGoal(g.id)}>Delete</button>
            {!isEditingGoal[0] && !isAddingGoal && (
              <button style={{ marginLeft: "0.5rem" }} onClick={() => {
                setIsEditingGoal([true, g.id]);
                setNewName(g.name);
                setNewHoursEstimate(g.hoursEstimate);
              }}>Edit</button>
            )}
          </li>
        ))}
      </ul>

      {(isAddingGoal || isEditingGoal[0]) && (
        <form onSubmit={isAddingGoal ? addGoal : editGoal} style={{ marginTop: "1rem" }}>
          <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Goal name" required />
          <input type="number" value={newHoursEstimate} onChange={(e) => setNewHoursEstimate(e.target.value)} placeholder="Hours estimate" required style={{ width: "60px", marginLeft: "0.5rem" }} />
          <button type="submit" style={{ marginLeft: "0.5rem" }}>{isAddingGoal ? "Add" : "Save"}</button>
          <button type="button" style={{ marginLeft: "0.5rem" }} onClick={() => {
            setIsAddingGoal(false);
            setIsEditingGoal([false, null]);
          }}>Cancel</button>
        </form>
      )}

      {!isAddingGoal && !isEditingGoal[0] && (
        <button onClick={() => setIsAddingGoal(true)}>+ Add Goal</button>
      )}

      <button style={{ marginTop: "1rem" }} onClick={() => setIsShowCompletedGoals(!isShowCompletedGoals)}>
        {isShowCompletedGoals ? "Hide Completed Goals" : "See Completed Goals"}
      </button>

      {isShowCompletedGoals && (
        <>
          <h2>Completed Goals</h2>
          <ul>
            {completedGoals.map((g) => (
              <li key={g.id}>
                {g.name} (+{g.hoursEstimate} hours)
                <button style={{ marginLeft: "1rem" }} onClick={() => revertGoal(g.id)}>Revert</button>
                <button style={{ marginLeft: "0.5rem", color: "red" }} onClick={() => removeGoal(g.id)}>Delete</button>
                <button style={{ marginLeft: "0.5rem" }} onClick={() => {
                  setIsEditingGoal([true, g.id]);
                  setNewName(g.name);
                  setNewHoursEstimate(g.hoursEstimate);
                }}>Edit</button>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
