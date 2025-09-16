import { useEffect } from "react";
import { format, isSameDay, isSameMonth, isSameYear } from "date-fns";

export default function useItemTabManager({ 
  user, ItemRepository, MotherItemModel, MotherItemRepository,
  setPendingItems, setCompletedItems, allMotherItemsMap, setAllMotherItemsMap, 
}) {
  
  useEffect(() => {
    if (!user) return;
    const unsubscribe = ItemRepository.onFieldChange("userId", user.uid, (items) => {
      setPendingItems(items.filter(i => !i.isDone));
      setCompletedItems(items.filter(i => i.isDone));
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    let unsubscribe = () => {};
  
    const updateMotherItemsMap = (items) => {
      const updatedMap = { ...allMotherItemsMap };
      items.forEach(item => { updatedMap[item.id] = item; });
      setAllMotherItemsMap(updatedMap);
    };

    if (MotherItemModel.name === "QuestCategory") {
      MotherItemRepository.findAll().then(updateMotherItemsMap); // case of MotherItemRepository = QuestCategoryRepository
    } else {
      unsubscribe = MotherItemRepository.onFieldChange("userId", user.uid, (items) => {
        updateMotherItemsMap(items);
      });
    }
  
    return () => unsubscribe();
  }, [user]);


  const changeStatus = async (item) => {
    console.log("Request to change status of item", item.id, "by user", user.uid);
    const updated = { ...item, status: item.isDone ? "pending" : "completed" };
    await ItemRepository.save(user.uid, updated);
  };

  const remove = async (id) => {
    if (!window.confirm("Are you sure? This action is irreversible.")) return;
    await ItemRepository.deleteMany(user.uid, [id]);
  };


  function formatDateRange(start, end) {
    if (!start || !end) return "";
  
    const s = new Date(start);
    const e = new Date(end);
    const now = new Date();
  
    const showYearStart = s.getFullYear() !== now.getFullYear();
    const showYearEnd = e.getFullYear() !== now.getFullYear();
  
    if (isSameDay(s, e)) {
      // same day → show full date once, then only time for end
      const fmt = `d MMM${showYearStart ? " yyyy" : ""} HH:mm`;
      return `${format(s, fmt)} - ${format(e, "HH:mm")}`;
    }
  
    if (isSameMonth(s, e)) {
      // same month → repeat day + time, year only if different from current
      const fmtStart = `d MMM${showYearStart ? " yyyy" : ""} HH:mm`;
      return `${format(s, fmtStart)} - ${format(e, "d HH:mm")}`;
    }
  
    if (isSameYear(s, e)) {
      // same year, different month
      const fmtStart = `d MMM${showYearStart ? " yyyy" : ""} HH:mm`;
      return `${format(s, fmtStart)} - ${format(e, "d MMM HH:mm")}`;
    }
  
    // different years
    return `${format(s, "d MMM yyyy HH:mm")} - ${format(e, "d MMM yyyy HH:mm")}`;
  }
  
  return {
    changeStatus,
    remove,
    formatDateRange,
  };
}