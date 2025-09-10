import './ItemTab.css';
import { useState, useCallback } from "react";
import useItemTabManager from "../hooks/useItemTabManager";

export default function ItemTab({
  user, 
  pendingItems: _pendingItems, setPendingItems: _setPendingItems, 
  completedItems: _completedItems, setCompletedItems: _setCompletedItems, 
  activeTab, thisTab,
  ItemModel, ItemRepository, MotherItemName, MotherItemRepository, motherItemVarName
}) {

  // If pendingItems and setPendingItems are provided, use them. Otherwise, initialize them.
  const [pendingItems, setPendingItems] =
    _pendingItems !== undefined && _setPendingItems !== undefined
      ? [_pendingItems, _setPendingItems]
      : useState([]);

  const [completedItems, setCompletedItems] =
    _completedItems !== undefined && _setCompletedItems !== undefined
      ? [_completedItems, _setCompletedItems]
      : useState([]);

  const [itemBeingEdited, setItemBeingEdited] = useState(null);
  const isEditingItem = itemBeingEdited !== null;
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isShowCompletedItems, setIsShowCompletedItems] = useState(false);
  const [allMotherItemsMap, setAllMotherItemsMap] = useState({});

  const manager = useItemTabManager({
    user, 
    pendingItems, setPendingItems, 
    completedItems, setCompletedItems, 
    activeTab, thisTab,
    ItemModel,
    ItemRepository,
    MotherItemName,
    MotherItemRepository,
    motherItemVarName,
    allMotherItemsMap,
    setAllMotherItemsMap, 
  });

  const ItemForm = () => {
    const [name, setName] = useState(itemBeingEdited?.name || "");
    const [motherItemsFks, setMotherItemsFks] = useState(itemBeingEdited?.[motherItemVarName] || []);
    const [hoursRange, setHoursRange] = useState(itemBeingEdited?.hoursRange || []);
  
    const finishAddEdit = () => {
      setIsAddingItem(false);
      setItemBeingEdited(null);
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      const item = new ItemModel({ 
        ...itemBeingEdited,
        name: name,
        [motherItemVarName]: motherItemsFks,
        hoursRange: hoursRange,
      })
      manager.saveAndReloadItem(user.uid, item);
      finishAddEdit();
    };
  
    return (
      <form onSubmit={handleSubmit} style={{ marginTop: "1rem" }}>
        <input
          type="text"
          value={name}
          placeholder="Item name"
          onChange={e => setName(e.target.value)}
          required
        />
        <select
          multiple
          value={motherItemsFks}
          onChange={e => setMotherItemsFks(Array.from(e.target.selectedOptions).map(o => o.value))}
          required
          style={{ width: "200px", marginLeft: "0.5rem" }}
        >
          {Object.entries(allMotherItemsMap).map(([id, name]) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </select>
        <select
          value={hoursRange.join(",")}
          onChange={e => setHoursRange(e.target.value.split(",").map(Number))}
          required
          style={{ width: "120px", marginLeft: "0.5rem" }}
        >
          <option value="" disabled>Select hours</option>
          <option value="1,2">1-2 hours</option>
          <option value="2,4">2-4 hours</option>
          <option value="4,8">4-8 hours</option>
          <option value="8,16">8-16 hours</option>
          <option value="16,32">16-32 hours</option>
          <option value="32,64">32-64 hours</option>
        </select>
        <button type="submit" style={{ marginLeft: "0.5rem" }}>
          {itemBeingEdited ? "Save" : "Add"}
        </button>
        <button type="button" style={{ marginLeft: "0.5rem" }} onClick={finishAddEdit}>
          Cancel
        </button>
      </form>
    );
  };


  const renderItem = useCallback((q) => (
    <li key={q.id} style={{ listStyle: "none" }}>
      <div className="item-frame">
        <span className="item-text">
          {q.name} | {(q[motherItemVarName]?.length > 0 ? q[motherItemVarName].map(id => allMotherItemsMap[id] || id).join(", ") : "No mother items")} | {(Array.isArray(q.hoursRange) && q.hoursRange.length === 2 ? `${q.hoursRange[0]}-${q.hoursRange[1]}` : q.hoursRange)} hour(s)
        </span>
        <div className="item-buttons">
          <button className="item-button" onClick={() => manager.changeStatus(q)}>{q.done ? "Revert" : "Done"}</button>
          <button className="item-button delete" onClick={() => manager.remove(q.id)}>Delete</button>
          {!isEditingItem && !isAddingItem && (
            <button className="item-button" onClick={() => setItemBeingEdited(q)}>Edit</button>
          )}
        </div>
      </div>
    </li>
  ), [allMotherItemsMap, manager]);


  return (
    <>
      <h2>Pending Items</h2>
      {pendingItems.length === 0 && <p>No pending items. Add your next item!</p>}
      <ul>
        {pendingItems.map(q => (renderItem(q)))}
      </ul>

      {(isEditingItem || isAddingItem) && (
        <ItemForm
          item={itemBeingEdited}
          allMotherItemsMap={allMotherItemsMap}
        />
      )}
      
      {!isAddingItem && !isEditingItem && (
        <button onClick={() => setIsAddingItem(true)}>+ Add Item</button>
      )}
      
      <button style={{ marginTop: "1rem" }} onClick={() => setIsShowCompletedItems(!isShowCompletedItems)}>
        {isShowCompletedItems ? "Hide Completed Items" : "See Completed Items"}
      </button>

      {isShowCompletedItems && (
        <>
          <h2>Completed Items</h2>
          <ul>
            {completedItems.map(q => (renderItem(q)))}
          </ul>
        </>
      )}
    </>
  );
}