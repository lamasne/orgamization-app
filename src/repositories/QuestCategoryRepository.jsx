import { QuestCategory } from "../models/QuestCategory";

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
import { CommonRepository } from "./CommonRepository";
import { db } from "../config/firebase-config";
import { collection, query, getDocs } from "firebase/firestore";

class QuestCategoryRepository extends CommonRepository {
  constructor() {
    super("questCategories", QuestCategoryMapper);
  }

  async findAll() {
    const q = query(collection(db, this.collectionName));
    const snap = await getDocs(q);
    return snap.docs.map(docSnap => this.mapper.fromDTO({ id: docSnap.id, ...docSnap.data() }));
  }
}

export const questCategoryRepository = new QuestCategoryRepository();