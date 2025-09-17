import { useEffect } from "react";
import { format, isSameDay, isSameMonth, isSameYear } from "date-fns";
import { QuestRepository } from "../repositories/QuestRepository";
import { QuestCategoryRepository } from "../repositories/QuestCategoryRepository";

export default function useQuestTabManager({ 
   user, 
   setPendingQuests, 
   setCompletedQuests, 
   allMotherQuestsMap, 
   setAllMotherQuestsMap, 
   allMotherCategoriesMap, 
   setAllMotherCategoriesMap 
}) {
  
useEffect(() => {
  if (!user) return;

  async function attachProgress(quest) {
    const progress = await quest.getCurrentProgress();
    quest.currentProgress = progress; // preserve class methods
    return quest;
  }

  async function withProgress(quests) {
    return Promise.all(quests.map(attachProgress));
  }

  const unsubscribeQuests = QuestRepository.onFieldChange("userId", user.uid, async (quests) => {
    const [pending, completed] = await Promise.all([
      withProgress(quests.filter(q => !q.isDone)),
      withProgress(quests.filter(q => q.isDone)),
    ]);
    setPendingQuests(pending);
    setCompletedQuests(completed);
  });

  const updateItemsMap = (items, setAllItemsMap) => {
    const updatedMap = {};
    items.forEach(item => { updatedMap[item.id] = item; });
    setAllItemsMap(updatedMap);
  };

  const unsubscribeMotherQuests = QuestRepository.onFieldChange("userId", user.uid, (quests) => {
    updateItemsMap(quests, setAllMotherQuestsMap);
  });

  QuestCategoryRepository.findAll()
    .then((categories) => updateItemsMap(categories, setAllMotherCategoriesMap));

  return () => {
    unsubscribeQuests();
    unsubscribeMotherQuests();
  };
}, [user]);



  const changeStatus = async (quest) => {
    console.log("Request to change status of quest", quest.id, "by user", user.uid);
    const updated = { ...quest, status: quest.isDone ? "pending" : "completed" };
    await QuestRepository.save(user.uid, updated);
  };

  const save = async (quest) => {
    await QuestRepository.save(user.uid, quest);
  };

  const remove = async (id) => {
    if (!window.confirm("Are you sure? This action is irreversible.")) return;
    await QuestRepository.deleteMany(user.uid, [id]);
  };

  function getCountDown(deadline) {
    if (!deadline) return "";
  
    const now = new Date();
    const target = new Date(deadline);
    const diffMs = target - now;
  
    if (diffMs <= 0) return "Expired";
  
    const totalSeconds = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
  
    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }  

  function toDateTimeLocalString(date) {
    if (!date) return "";
    const pad = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function formatDate(date) {
    if (!date) return "";
    const d = new Date(date);
    const now = new Date();
  
    const showYear = d.getFullYear() !== now.getFullYear();
    const fmt = `d MMM${showYear ? " yyyy" : ""} HH:mm`;
  
    return format(d, fmt);
  }

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
    save,
    remove,
    changeStatus,
    formatDate,
    formatDateRange,
    toDateTimeLocalString,
    getCountDown,
  };
}