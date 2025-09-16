import { SessionRepository } from "../repositories/SessionRepository";
import { QuestRepository } from "../repositories/QuestRepository";
import { Session } from "../models/Session";
import { Quest } from "../models/Quest";
import { useState, useCallback } from "react";
import useItemTabManager from "../hooks/useItemTabManager";

export default function SessionsTab({
  user
}) {

  const ItemModel = Session;
  const ItemRepository = SessionRepository;
  const MotherItemModel = Quest;
  const MotherItemRepository = QuestRepository;

  const motherItemVarName = "motherQuestsFks";

  const [pendingItems, setPendingItems] = useState([]);
  const [completedItems, setCompletedItems] = useState([]);

  const [itemBeingEdited, setItemBeingEdited] = useState(null);
  const isEditingItem = itemBeingEdited !== null;
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isShowCompletedItems, setIsShowCompletedItems] = useState(false);
  const [allMotherItemsMap, setAllMotherItemsMap] = useState({});

  const manager = useItemTabManager({
    user, ItemRepository, MotherItemModel, MotherItemRepository,
    setPendingItems, setCompletedItems, allMotherItemsMap, setAllMotherItemsMap
  });

  const ItemForm = () => {
    const [name, setName] = useState(itemBeingEdited?.name || "");
    const [motherItemsFks, setMotherItemsFks] = useState(itemBeingEdited?.[motherItemVarName] || []);
    const [associatedProgress, setAssociatedProgress] = useState(itemBeingEdited?.associatedProgress || 0);

    const finishAddEdit = () => {
      setIsAddingItem(false);
      setItemBeingEdited(null);
    };

    const handleSubmit = async (e) => {
      console.log("user", user.uid, "Will update/save item", itemBeingEdited?.name, "with", name, motherItemsFks, associatedProgress);
      e.preventDefault();
      const item = new ItemModel({ 
        ...itemBeingEdited,
        userId: user.uid,
        name: name,
        [motherItemVarName]: motherItemsFks,
        associatedProgress: associatedProgress,
      })
      ItemRepository.save(user.uid, item);
      finishAddEdit();
    };

    return (
      <form onSubmit={handleSubmit} className="form-card">
        <input
          type="text"
          value={name}
          placeholder="Item name"
          onChange={e => setName(e.target.value)}
          required
          className="form-input"
        />
        <select
          multiple
          value={motherItemsFks}
          onChange={e => setMotherItemsFks(Array.from(e.target.selectedOptions).map(o => o.value))}
          required
          className="form-select"
        >
          {Object.entries(allMotherItemsMap).map(([id, motherItem]) => (
            <option key={id} value={id}>{motherItem.name}</option>
          ))}
        </select>
        {allMotherItemsMap[motherItemsFks[0]]?.progressMetricsName !== "hoursSpent"  && (
          <input
            type="number"
            value={associatedProgress}
            placeholder={`Associated progress (max: ${allMotherItemsMap[motherItemsFks[0]]?.progressMetricsValue})`}
            onChange={e => setAssociatedProgress(Number(e.target.value))}
            required
            className="form-input"
          />
        )}
        <button type="submit" className="button primary"> {itemBeingEdited ? "Save" : "Add"} </button>
        <button type="button" className="button" onClick={finishAddEdit}>Cancel</button>
      </form>
    );
  };

  const renderItem = useCallback((q) => (
    <li key={q.id} className="card-li">
      <div className="card">
        <span className="card-text">
          {q.name} 
          <span className="card-splitter">✦</span>
          {manager.formatDateRange(q.start, q.end)}
          <span className="card-splitter">✦</span>
          {" ("}{(q[motherItemVarName]?.length > 0 ? q[motherItemVarName].map(id => allMotherItemsMap[id].name || id).join(", ") : "No mother quests")}{")"}
        </span>
        <div className="card-buttons">
          <button className="card-button done" onClick={() => manager.changeStatus(q)}>{q.done ? "Revert" : "Done"}</button>
          <button className="card-button delete" onClick={() => manager.remove(q.id)}>Delete</button>
          {!isEditingItem && !isAddingItem && (
            <button className="card-button edit" onClick={() => setItemBeingEdited(q)}>Edit</button>
          )}
        </div>
      </div>
    </li>
  ), [allMotherItemsMap, manager]);

  return (
    <>
      <h2 style={{ marginBottom: "0.5rem" }}>Pending</h2>
      {pendingItems.length === 0 && <p>No pending items. Add your next item!</p>}
      <ul>
        {pendingItems.map(q => renderItem(q))}
      </ul>

      {(isEditingItem || isAddingItem) && <ItemForm />}

      <div className="row-buttons">
        {!isAddingItem && !isEditingItem && (
          <button className="button" onClick={() => setIsAddingItem(true)}>+ Add Item</button>
        )}
        <button className="button" onClick={() => setIsShowCompletedItems(!isShowCompletedItems)}>
          {isShowCompletedItems ? "Hide Completed Items" : "See Completed Items"}
        </button>
      </div>

      {isShowCompletedItems && (
        <>
          <h2>Completed</h2>
          <ul>
            {completedItems.map(q => renderItem(q))}
          </ul>
        </>
      )}
    </>
  );
}
