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
  const [newHoursEstimate, setNewHoursEstimate] = useState(0);

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
      hoursEstimate: Number(hoursEstimate),
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

    const updatedQuest = {
      ...allQuests[questIdx],
      name,
      hoursEstimate: Number(hoursEstimate),
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
            {q.name} ({q.hoursEstimate} hours)
            <button style={{ marginLeft: "1rem" }} onClick={() => markDone(q.id)}>Done</button>
            <button style={{ marginLeft: "0.5rem", color: "red" }} onClick={() => deleteQuestWrapper(q.id)}>Delete</button>
            {!isEditingQuest[0] && !isAddingQuest && <button style={{ marginLeft: "0.5rem" }} onClick={() => {
              const quest = pendingQuests.concat(completedQuests).find(x => x.id === q.id);
              setNewName(quest.name);
              setNewHoursEstimate(quest.hoursEstimate);
              setIsEditingQuest([true, q.id]);
            }}>Edit</button>}
          </li>
        ))}
      </ul>

      {isEditingQuest[0] && (
        <form onSubmit={(e) => editQuest(e, newName, newHoursEstimate)} style={{ marginTop: "1rem" }}>
          <input type="text" value={newName} onChange={e => setNewName(e.target.value)} required />
          <input type="number" value={newHoursEstimate} onChange={e => setNewHoursEstimate(e.target.value)} required style={{ width: "60px", marginLeft: "0.5rem" }} />
          <button type="submit" style={{ marginLeft: "0.5rem" }}>Save</button>
          <button type="button" style={{ marginLeft: "0.5rem" }} onClick={() => setIsEditingQuest([false, null])}>Cancel</button>
        </form>
      )}
      {isAddingQuest && (
        <form onSubmit={(e) => addQuest(e, newName, newHoursEstimate)} style={{ marginTop: "1rem" }}>
          <input type="text" placeholder="Quest name" value={newName} onChange={e => setNewName(e.target.value)} required />
          <input type="number" placeholder="hoursEstimate" value={newHoursEstimate} onChange={e => setNewHoursEstimate(e.target.value)} required style={{ width: "60px", marginLeft: "0.5rem" }} />
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
                {q.name} (+{q.hoursEstimate} hours)
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
