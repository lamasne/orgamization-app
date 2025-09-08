import { useState } from "react";
import { Quest } from "../models/Quest";
import { QuestRepository } from "../repositories/QuestRepository";
import useQuestsTabManager from "../hooks/useQuestsTabManager";

export default function QuestsTab({
  user, pendingQuests, setPendingQuests, completedQuests, setCompletedQuests, activeTab, thisTab
}) {
  const [idQuestBeingEdited, setIdQuestBeingEdited] = useState(null);
  const isEditingQuest = idQuestBeingEdited !== null;
  const [isAddingQuest, setIsAddingQuest] = useState(null);
  const [isShowCompletedQuests, setIsShowCompletedQuests] = useState(false);

  const [newName, setNewName] = useState("");
  const [newMotherGoalsFKs, setNewMotherGoalsFKs] = useState("");
  const [newHoursEstimate, setNewHoursEstimate] = useState("");

  const [allGoalsMap, setAllGoalsMap] = useState({}); // id -> name

  const manager = useQuestsTabManager({
    user, pendingQuests, setPendingQuests, completedQuests, setCompletedQuests, activeTab, thisTab,
    setAllGoalsMap,
    saveItem: (uid, quest) => QuestRepository.saveQuest(uid, quest),
    deleteItems: (uid, ids) => QuestRepository.deleteMany(uid, ids)
  });


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
      .find(q => q.id === idQuestBeingEdited);
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
    setIdQuestBeingEdited(null);
  };


  const renderQuest = (q, isDone, isEditingQuest, isAddingQuest) => (
      <li key={q.id}>
      {q.name}{" | "}
      {(q.motherGoalsFKs && q.motherGoalsFKs.length > 0) 
        ? q.motherGoalsFKs.map(id => allGoalsMap[id] || id).join(", ") 
        : "No mother goals"}{" | "}
      {(Array.isArray(q.hoursEstimate) && q.hoursEstimate.length === 2) 
        ? `${q.hoursEstimate[0]}-${q.hoursEstimate[1]}` 
        : q.hoursEstimate}{" hour(s)"}
        <button
          style={{ marginLeft: "1rem" }}
          onClick={() => manager.changeStatus(q)}
        >
          {isDone ? "Revert" : "Done"}
        </button>
      <button style={{ marginLeft: "0.5rem", color: "red" }} onClick={() => manager.remove(q.id)}>Delete</button>
      {!isEditingQuest && !isAddingQuest && (
        <button style={{ marginLeft: "0.5rem" }} onClick={() => {
          const quest = pendingQuests.find(x => x.id === q.id);
          setNewName(quest.name);
          setNewHoursEstimate(Array.isArray(quest.hoursEstimate) ? quest.hoursEstimate.join(",") : quest.hoursEstimate);
          setNewMotherGoalsFKs(
            (quest.motherGoalsFKs && quest.motherGoalsFKs.length > 0) 
            ? quest.motherGoalsFKs.map(id => allGoalsMap[id] || id).join(", ") 
            : ""
          );
          setIdQuestBeingEdited(q.id);
        }}>Edit</button>
      )}
    </li>
  );


  return (
    <>
      <h2>Pending Quests</h2>
      {pendingQuests.length === 0 && <p>No pending quests. Add your next quest!</p>}
      <ul>
        {pendingQuests.map(q => (renderQuest(q, false, isEditingQuest, isAddingQuest)))}
      </ul>

      {isEditingQuest && (
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
          <button type="button" style={{ marginLeft: "0.5rem" }} onClick={() => setIdQuestBeingEdited(null)}>Cancel</button>
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
            {completedQuests.map(q => (renderQuest(q, true, isEditingQuest, isAddingQuest)))}
          </ul>
        </>
      )}
    </>
  );
}