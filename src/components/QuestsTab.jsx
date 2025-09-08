import { useState, useEffect } from "react";
import { Quest } from "../domain/quest";
import { QuestRepository } from "../repositories/QuestRepository";
import { GoalRepository } from "../repositories/GoalRepository";

export default function QuestsTab({
  user, pendingQuests, setPendingQuests, completedQuests, setCompletedQuests, activeTab
}) {
  const [isEditingQuest, setIsEditingQuest] = useState([false, null]);
  const [isAddingQuest, setIsAddingQuest] = useState(null);
  const [isShowCompletedQuests, setIsShowCompletedQuests] = useState(false);

  const [newName, setNewName] = useState("");
  const [newMotherGoalsFKs, setNewMotherGoalsFKs] = useState("");
  const [newHoursEstimate, setNewHoursEstimate] = useState("");

  const [allGoalsMap, setAllGoalsMap] = useState({}); // id -> name

  // Fetch all goal names on mount or when going back to quest tab
  useEffect(() => {
    if (activeTab !== "quests") return;
    GoalRepository.findUserGoals(user.uid).then(goals => {
      const map = {};
      goals.forEach(g => { map[g.id] = g.name; });
      setAllGoalsMap(map);
    });
  }, [activeTab, user]);

  const markDone = async (id) => {
    const quest = pendingQuests.find(q => q.id === id);
    if (!quest) return;
    quest.done = true;
    await QuestRepository.saveQuest(user.uid, quest);
    setPendingQuests(pendingQuests.filter(q => q.id !== id));
    setCompletedQuests([...completedQuests, quest]);
  };

  const revertQuest = async (id) => {
    const quest = completedQuests.find(q => q.id === id);
    if (!quest) return;
    quest.done = false;
    await QuestRepository.saveQuest(user.uid, quest);
    setCompletedQuests(completedQuests.filter(q => q.id !== id));
    setPendingQuests([...pendingQuests, quest]);
  };

  const deleteQuestWrapper = async (id) => {
    if (!window.confirm("Are you sure? This action is irreversible.")) return;
    await QuestRepository.deleteMany(user.uid, [id]);
    setPendingQuests(pendingQuests.filter(q => q.id !== id));
    setCompletedQuests(completedQuests.filter(q => q.id !== id));
  };

  const addQuest = async (e) => {
    e.preventDefault();
    const hoursArr = typeof newHoursEstimate === "string"
      ? newHoursEstimate.split(',').map(Number)
      : newHoursEstimate;

    const motherGoalsArr = typeof newMotherGoalsFKs === "string"
      ? newMotherGoalsFKs.split(',') 
      : newMotherGoalsFKs;

    const newQuest = new Quest({
      userId: user.uid,
      name: newName,
      motherGoalsFKs: motherGoalsArr,
      hoursEstimate: hoursArr
    });

    await QuestRepository.saveQuest(user.uid, newQuest);
    setPendingQuests([...pendingQuests, newQuest]);
    setIsAddingQuest(false);
    setNewName(""); setNewMotherGoalsFKs(""); setNewHoursEstimate("");
  };

  const editQuest = async (e) => {
    e.preventDefault();
    const quest = pendingQuests.concat(completedQuests)
      .find(q => q.id === isEditingQuest[1]);
    if (!quest) return;

    const hoursArr = typeof newHoursEstimate === "string"
      ? newHoursEstimate.split(',').map(Number)
      : newHoursEstimate;

    const motherGoalsArr = typeof newMotherGoalsFKs === "string"
      ? newMotherGoalsFKs.split(',') 
      : newMotherGoalsFKs;

    quest.name = newName;
    quest.motherGoalsFKs = motherGoalsArr;
    quest.hoursEstimate = hoursArr;

    await QuestRepository.saveQuest(user.uid, quest);

    const updatedQuests = pendingQuests.concat(completedQuests).map(q =>
      q.id === quest.id ? quest : q
    );
    setPendingQuests(updatedQuests.filter(q => !q.done));
    setCompletedQuests(updatedQuests.filter(q => q.done));
    setIsEditingQuest([false, null]);
  };

  return (
    <>
      <h2>Pending Quests</h2>
      {pendingQuests.length === 0 && <p>No pending quests. Add your next quest!</p>}
      <ul>
        {pendingQuests.map(q => (
          <li key={q.id}>
          {q.name}{" | "}
          {(q.motherGoalsFKs && q.motherGoalsFKs.length > 0) 
            ? q.motherGoalsFKs.map(id => allGoalsMap[id] || id).join(", ") 
            : "No mother goals"}{" | "}
          ({q.hoursEstimate && q.hoursEstimate.length === 2 
            ? `${q.hoursEstimate[0]}-${q.hoursEstimate[1]}` 
            : q.hoursEstimate}{" "}hours)
            <button style={{ marginLeft: "1rem" }} onClick={() => markDone(q.id)}>Done</button>
            <button style={{ marginLeft: "0.5rem", color: "red" }} onClick={() => deleteQuestWrapper(q.id)}>Delete</button>
            {!isEditingQuest[0] && !isAddingQuest && (
              <button style={{ marginLeft: "0.5rem" }} onClick={() => {
                const quest = pendingQuests.find(x => x.id === q.id);
                setNewName(quest.name);
                setNewHoursEstimate(Array.isArray(quest.hoursEstimate) ? quest.hoursEstimate.join(",") : quest.hoursEstimate);
                setNewMotherGoalsFKs(
                  (quest.motherGoalsFKs && quest.motherGoalsFKs.length > 0) 
                  ? quest.motherGoalsFKs.map(id => allGoalsMap[id] || id).join(", ") 
                  : ""
                );
                setIsEditingQuest([true, q.id]);
              }}>Edit</button>
          )}
          </li>
        ))}
      </ul>

      {isEditingQuest[0] && (
        <form onSubmit={(e) => editQuest(e, newName, newMotherGoalsFKs, newHoursEstimate)} style={{ marginTop: "1rem" }}>
          <input type="text" value={newName} onChange={e => setNewName(e.target.value)} required />
          <select
            value={newMotherGoalsFKs}
            onChange={e => setNewMotherGoalsFKs(e.target.value)}
            required
            style={{ width: "120px", marginLeft: "0.5rem" }}
          >
            <option value="" disabled>Select mother goals</option>
            {Object.entries(allGoalsMap).map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
          <select
            value={newHoursEstimate || ""}
            onChange={e => setNewHoursEstimate(e.target.value)}
            required
            style={{ width: "120px", marginLeft: "0.5rem" }}
          >
            <option value="" disabled>Select hours</option>
            <option value={"1,2"}>1-2 hours</option>
            <option value={"2,4"}>2-4 hours</option>
            <option value={"4,8"}>4-8 hours</option>
            <option value={"8,16"}>8-16 hours</option>
            <option value={"16,32"}>16-32 hours</option>
            <option value={"32,64"}>32-64 hours</option>
          </select>
          <button type="submit" style={{ marginLeft: "0.5rem" }}>Save</button>
          <button type="button" style={{ marginLeft: "0.5rem" }} onClick={() => setIsEditingQuest([false, null])}>Cancel</button>
        </form>
      )}
      {isAddingQuest && (
        <form onSubmit={(e) => addQuest(e, newName, newMotherGoalsFKs, newHoursEstimate)} style={{ marginTop: "1rem" }}>
          <input type="text" placeholder="Quest name" value={newName} onChange={e => setNewName(e.target.value)} required />
          <select
            value={newMotherGoalsFKs}
            onChange={e => setNewMotherGoalsFKs(e.target.value)}
            required
            style={{ width: "120px", marginLeft: "0.5rem" }}
          >
            <option value="" disabled>Select mother goals</option>
            {Object.entries(allGoalsMap).map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
          <select
            value={newHoursEstimate}
            onChange={e => setNewHoursEstimate(e.target.value)}
            required
            style={{ width: "120px", marginLeft: "0.5rem" }}
          >
            <option value="" disabled>Select hours</option>
            <option value={"1,2"}>1-2 hours</option>
            <option value={"2,4"}>2-4 hours</option>
            <option value={"4,8"}>4-8 hours</option>
            <option value={"8,16"}>8-16 hours</option>
            <option value={"16,32"}>16-32 hours</option>
            <option value={"32,64"}>32-64 hours</option>
          </select>
          <button type="submit" style={{ marginLeft: "0.5rem" }}>Add</button>
          <button type="button" style={{ marginLeft: "0.5rem" }} onClick={() => setIsAddingQuest(false)}>Cancel</button>
        </form>
      )}
      {!isAddingQuest && !isEditingQuest[0] && <button onClick={() => setIsAddingQuest(true)}>+ Add Quest</button>}

      <button style={{ marginTop: "1rem" }} onClick={() => setIsShowCompletedQuests(!isShowCompletedQuests)}>
        {isShowCompletedQuests ? "Hide Completed Quests" : "See Completed Quests"}
      </button>

      {isShowCompletedQuests && (
        <>
          <h2>Completed Quests</h2>
          <ul>
            {completedQuests.map(q => (
              <li key={q.id}>
                {q.name}{" | "}
                {(q.motherGoalsFKs && q.motherGoalsFKs.length > 0) 
                  ? q.motherGoalsFKs.map(id => allGoalsMap[id] || id).join(", ") 
                  : "No mother goals"}{" | "}
                ({q.hoursSpent} hours)
                <button style={{ marginLeft: "1rem" }} onClick={() => revertQuest(q.id)}>Revert</button>
                <button style={{ marginLeft: "0.5rem", color: "red" }} onClick={() => deleteQuestWrapper(q.id)}>Delete</button>
                {!isEditingQuest[0] && !isAddingQuest && (
                  <button style={{ marginLeft: "0.5rem" }} onClick={() => {
                    const quest = completedQuests.find(x => x.id === q.id);
                    setNewName(quest.name);
                    setNewHoursEstimate(Array.isArray(quest.hoursEstimate) ? quest.hoursEstimate.join(",") : quest.hoursEstimate);
                    setNewMotherGoalsFKs(
                      (quest.motherGoalsFKs && quest.motherGoalsFKs.length > 0) 
                      ? quest.motherGoalsFKs.map(id => allGoalsMap[id] || id).join(", ") 
                      : ""
                    );
                    setIsEditingQuest([true, q.id]);
                  }}>Edit</button>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}