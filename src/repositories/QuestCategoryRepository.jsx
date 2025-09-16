import { QuestCategory } from "../models/QuestCategory";
import { ItemRepository } from "./ItemRepository";

// Mapper
export const QuestCategoryMapper = {
  fromDTO: (doc) => new QuestCategory({
    id: doc.id,
    name: doc.name,
    desc: doc.desc,
  }),
  toDTO: (category) => ({
    id: category.id,
    name: category.name,
    desc: category.desc,
  })
};

// Repository
export const QuestCategoryRepository = new ItemRepository("questCategories", QuestCategoryMapper);
