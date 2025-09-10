import { useEffect } from "react";

export default function useItemTabManager({ 
  user, pendingItems, setPendingItems, completedItems, setCompletedItems, activeTab, thisTab, 
  ItemModel, ItemRepository, MotherItemName, MotherItemRepository, 
  motherItemVarName, allMotherItemsMap, setAllMotherItemsMap, 
}) {
  const loadAllItems = async () => {
    if (!user) return;
    const items = await ItemRepository.findByUserId(user.uid);
    setPendingItems(items.filter(i => !i.done));
    setCompletedItems(items.filter(i => i.done));
  };
  
  const loadAllMotherItems = async () => {
    if (!user) return;
    const motherItems = await MotherItemRepository.findByUserId(user.uid);
    const map = {};
    motherItems.forEach(mi => { map[mi.id] = mi.name; });
    setAllMotherItemsMap(map);
  };

  useEffect(() => {
    if (!user || activeTab !== thisTab) return;
    loadAllItems();
    loadAllMotherItems();
  }, [activeTab, user]);
  
  // Create a default item for each mother item not covered by any pending item
  const generateDefaultItems = (missingMotherItems) => {
    missingMotherItems.forEach(([id, name]) => {
      const item = new ItemModel({
        userId: user.uid,
        name: `Auto-generated: define ${ItemModel.name} for ${MotherItemName}: ${name}`,
        hoursRange: [1, 2],
        [motherItemVarName]: [id],
        comment: `Default ${ItemModel.name} created automatically`,
      });
      saveAndReloadItem(user.uid, item);
    });
  }

  // // If a mother item is not present in any of the pending items.[motherItemVarName], create a default item for it
  // useEffect(() => {
  //   if (!user || activeTab !== thisTab) return;
  //   const coveredMotherItemsIds = new Set(
  //     pendingItems.flatMap(i => i[motherItemVarName])
  //   );
  //   const missingMotherItems = Object.entries(allMotherItemsMap)
  //     .filter(([id, item]) => !coveredMotherItemsIds.has(id) && !item.done);
  //   generateDefaultItems(missingMotherItems);
  // }, [activeTab, user, pendingItems, allMotherItemsMap]);
  
  
  const saveAndReloadItem = async (uid, item) => {
    await ItemRepository.save(uid, item);
    loadAllItems();
  };

  const changeStatus = async (item) => {
    const updated = { ...item, done: !item.done };
    await ItemRepository.save(user.uid, updated);

    const newPending = pendingItems.filter(i => i.id !== item.id);
    const newCompleted = completedItems.filter(i => i.id !== item.id);

    if (updated.done) {
      setPendingItems(newPending);
      setCompletedItems([...newCompleted, updated]);
    } else {
      setCompletedItems(newCompleted);
      setPendingItems([...newPending, updated]);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Are you sure? This action is irreversible.")) return;
    await ItemRepository.deleteMany(user.uid, [id]);
    setPendingItems(pendingItems.filter(i => i.id !== id));
    setCompletedItems(completedItems.filter(i => i.id !== id));
  };

  return {
    loadAllItems,
    changeStatus,
    remove,
    saveAndReloadItem,
  };
}