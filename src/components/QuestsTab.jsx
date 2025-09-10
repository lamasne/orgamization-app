import { QuestRepository } from "../repositories/QuestRepository";
import { GoalRepository } from "../repositories/GoalRepository";
import ItemTab from "./ItemTab";
import { Quest } from "../models/Quest";
import { Goal } from "../models/Goal";

export default function QuestsTab({
  user, pendingQuests, setPendingQuests, completedQuests, setCompletedQuests, activeTab, thisTab
}) {
  return (
    <ItemTab
      user={user}
      pendingItems={pendingQuests}
      setPendingItems={setPendingQuests}
      completedItems={completedQuests}
      setCompletedItems={setCompletedQuests}
      activeTab={activeTab}
      thisTab={thisTab}
      ItemModel={Quest}
      ItemRepository={QuestRepository}
      MotherItemName="goal"
      MotherItemRepository={GoalRepository}
      motherItemVarName="motherGoalsFks"
    />
  );
}