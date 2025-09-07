import { createQuestDTO } from "../DTOs/QuestDTO";
import { saveQuest, deleteQuests } from "../services/questService";
import { useState } from "react";

export default function QuestsTab({
  user, pendingQuests, setPendingQuests, completedQuests, setCompletedQuests,
}) {
  const [isEditingQuest, setIsEditingQuest] = useState([false, null]);
  const [isAddingQuest, setIsAddingQuest] = useState(null);
  const [isShowCompletedQuests, setIsShowCompletedQuests] = useState(false);

  const [newName, setNewName] = useState("");
  const [newHoursEstimate, setNewHoursEstimate] = useState("");

  const markDone = async (id) => {
    const updatedPending = pendingQuests.filter(q => q.id !== id);
    const doneQuest = pendingQuests.find(q => q.id === id);
    const updatedCompleted = [...completedQuests, { ...doneQuest, done: true }];
    await saveQuest(user.uid, { ...doneQuest, done: true });
    setPendingQuests(updatedPending);
    setCompletedQuests(updatedCompleted);
  };

  const revertQuest = async (id) => {
    const updatedCompleted = completedQuests.filter(q => q.id !== id);
    const revertedQuest = completedQuests.find(q => q.id === id);
    const updatedPending = [...pendingQuests, { ...revertedQuest, done: false }];
    await saveQuest(user.uid, { ...revertedQuest, done: false });
    setPendingQuests(updatedPending);
    setCompletedQuests(updatedCompleted);
  };

  const deleteQuestWrapper = async (id) => {
    if (!window.confirm("Are you sure? This action is irreversible.")) return;
    const updatedPending = pendingQuests.filter(q => q.id !== id);
    const updatedCompleted = completedQuests.filter(q => q.id !== id);
    await deleteQuests(user.uid, [id]);
    setPendingQuests(updatedPending);
    setCompletedQuests(updatedCompleted);
  };

  const addQuest = async (e, name, hoursEstimate) => {
    e.preventDefault(); // Prevent refreshing and losing states
    const newQuest = createQuestDTO({
      userId: user.uid,
      name: name,
      hoursEstimate: typeof hoursEstimate === "string" ? hoursEstimate.split(',').map(Number) : hoursEstimate,
    });
    await saveQuest(user.uid, newQuest);
    setPendingQuests([...pendingQuests, newQuest]);
    setIsAddingQuest(false);
  };

  const editQuest = async (e, name, hoursEstimate) => {
    e.preventDefault();
    const allQuests = [...pendingQuests, ...completedQuests];
    const questIdx = allQuests.findIndex(q => q.id === isEditingQuest[1]);
    if (questIdx === -1) return;

    const hoursArr = typeof hoursEstimate === "string" ? hoursEstimate.split(',').map(Number) : hoursEstimate;
    const updatedQuest = {
      ...allQuests[questIdx],
      name,
      hoursEstimate: hoursArr,
    };
    await saveQuest(user.uid, updatedQuest);

    const updatedQuests = allQuests.map(q =>
      q.id === updatedQuest.id ? updatedQuest : q
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
            {q.name} ({q.hoursEstimate && q.hoursEstimate.length === 2 ? `${q.hoursEstimate[0]}-${q.hoursEstimate[1]}` : q.hoursEstimate} hours)
            <button style={{ marginLeft: "1rem" }} onClick={() => markDone(q.id)}>Done</button>
            <button style={{ marginLeft: "0.5rem", color: "red" }} onClick={() => deleteQuestWrapper(q.id)}>Delete</button>
            {!isEditingQuest[0] && !isAddingQuest && <button style={{ marginLeft: "0.5rem" }} onClick={() => {
              const quest = pendingQuests.concat(completedQuests).find(x => x.id === q.id);
              setNewName(quest.name);
              setNewHoursEstimate(Array.isArray(quest.hoursEstimate) ? quest.hoursEstimate.join(",") : quest.hoursEstimate);
              setIsEditingQuest([true, q.id]);
            }}>Edit</button>}
          </li>
        ))}
      </ul>

      {isEditingQuest[0] && (
        <form onSubmit={(e) => editQuest(e, newName, newHoursEstimate)} style={{ marginTop: "1rem" }}>
          <input type="text" value={newName} onChange={e => setNewName(e.target.value)} required />
          {/* - make hoursEstimate a range 2^n to 2^{n+1} with n natural (easier to estimate quickly) */}
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
        <form onSubmit={(e) => addQuest(e, newName, newHoursEstimate)} style={{ marginTop: "1rem" }}>
          <input type="text" placeholder="Quest name" value={newName} onChange={e => setNewName(e.target.value)} required />
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
                {q.name} (+{q.hoursEstimate && q.hoursEstimate.length === 2 ? `${q.hoursEstimate[0]}-${q.hoursEstimate[1]}` : q.hoursEstimate} hours)
                <button style={{ marginLeft: "1rem" }} onClick={() => revertQuest(q.id)}>Revert</button>
                <button style={{ marginLeft: "0.5rem", color: "red" }} onClick={() => deleteQuestWrapper(q.id)}>Delete</button>
                <button style={{ marginLeft: "0.5rem" }} onClick={() => {
                  setIsEditingQuest([true, q.id]);
                }}>Edit</button>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
