import { GoalRepository } from "../repositories/GoalRepository";
import { CategoryRepository } from "../repositories/CategoryRepository";
import ItemTab from "./ItemTab";
import { Goal } from "../models/Goal";

export default function GoalsTab({
  user, activeTab, thisTab
}) {

  return (
    <ItemTab
      user={user}
      activeTab={activeTab}
      thisTab={thisTab}
      ItemModel={Goal}
      ItemRepository={GoalRepository}
      MotherItemName="category"
      MotherItemRepository={CategoryRepository}
      motherItemVarName="categoriesFks"
    />
  );
}