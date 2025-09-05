import { useState } from "react";

export default function QuestsTab({
  pendingQuests, completedQuests,
  markDone, revertQuest, deleteQuest,
  addQuest,
  showForm, setShowForm,
  editingQuest, setEditingQuest,
  editName, setEditName,
  editXP, setEditXP,
  handleEditSave,
  showCompleted, setShowCompleted,
}) {
  const [newQuestName, setNewQuestNameLocal] = useState("");
  const [newQuestXP, setNewQuestXPLocal] = useState(0);

  return (
    <>
      <h2>Pending Quests</h2>
      <ul>
        {pendingQuests.map(q => (
          <li key={q.id}>
            {q.name} (+{q.xp} XP)
            <button style={{ marginLeft: "1rem" }} onClick={() => markDone(q.id)}>Done</button>
            <button style={{ marginLeft: "0.5rem", color: "red" }} onClick={() => deleteQuest(q.id)}>Delete</button>
            <button style={{ marginLeft: "0.5rem" }} onClick={() => {
              setEditingQuest(q);
              setEditName(q.name);
              setEditXP(q.xp);
            }}>Edit</button>
          </li>
        ))}
      </ul>

      {editingQuest && (
        <form onSubmit={handleEditSave} style={{ marginTop: "1rem" }}>
          <input type="text" value={editName} onChange={e => setEditName(e.target.value)} required />
          <input type="number" value={editXP} onChange={e => setEditXP(e.target.value)} required style={{ width: "60px", marginLeft: "0.5rem" }} />
          <button type="submit" style={{ marginLeft: "0.5rem" }}>Save</button>
          <button type="button" style={{ marginLeft: "0.5rem" }} onClick={() => setEditingQuest(null)}>Cancel</button>
        </form>
      )}

      {!showForm && <button onClick={() => setShowForm(true)}>+ Add Quest</button>}
      {showForm && (
        <form onSubmit={(e) => addQuest(e, newQuestName, newQuestXP)} style={{ marginTop: "1rem" }}>
          <input type="text" placeholder="Quest name" value={newQuestName} onChange={e => setNewQuestNameLocal(e.target.value)} required />
          <input type="number" placeholder="XP" value={newQuestXP} onChange={e => setNewQuestXPLocal(e.target.value)} required style={{ width: "60px", marginLeft: "0.5rem" }} />
          <button type="submit" style={{ marginLeft: "0.5rem" }}>Add</button>
          <button type="button" style={{ marginLeft: "0.5rem" }} onClick={() => setShowForm(false)}>Cancel</button>
        </form>
      )}

      <button style={{ marginTop: "1rem" }} onClick={() => setShowCompleted(!showCompleted)}>
        {showCompleted ? "Hide Completed Quests" : "See Completed Quests"}
      </button>

      {showCompleted && (
        <>
          <h2>Completed Quests</h2>
          <ul>
            {completedQuests.map(q => (
              <li key={q.id}>
                {q.name} (+{q.xp} XP)
                <button style={{ marginLeft: "1rem" }} onClick={() => revertQuest(q.id)}>Revert</button>
                <button style={{ marginLeft: "0.5rem", color: "red" }} onClick={() => deleteQuest(q.id)}>Delete</button>
                <button style={{ marginLeft: "0.5rem" }} onClick={() => {
                  setEditingQuest(q);
                  setEditName(q.name);
                  setEditXP(q.xp);
                }}>Edit</button>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
