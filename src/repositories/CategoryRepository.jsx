import { Category } from "../models/Category";

// Mapper
export const CategoryMapper = {
  fromDTO: (doc) => new Category({
    id: doc.id,
    userId: doc.userId,
    name: doc.name || "",
    categoriesFks: doc.categoriesFks || [],
    deadline: doc.deadline ? new Date(doc.deadline) : null,
    done: Boolean(doc.done || false),
    comment: doc.comment || "",
  }),
  toDTO: (category) => ({
    id: category.id,
    userId: category.userId,
    name: category.name,
    categoriesFks: category.categoriesFks,
    deadline: category.deadline instanceof Date ? category.deadline.toISOString() : category.deadline,
    done: category.done,
    comment: category.comment,
  })
};

// Repository
import { collection, doc, getDocs, setDoc, deleteDoc, query, where } from "firebase/firestore";
import { db } from "../config/firebase-config";

export const CategoryRepository = {
  collectionName: "fundamentalCategories",

  async findByUserId(userId) {
    if (!userId) return [];
    const categories = [];
    const q = query(collection(db, CategoryRepository.collectionName));
    const snapshot = await getDocs(q);
    snapshot.forEach(doc => categories.push(CategoryMapper.fromDTO({ id: doc.id, ...doc.data() })));
    return categories;
  },

  async findByIds(userId, categoriesIds) {
    if (!userId || !categoriesIds?.length) return [];

    const categories = [];
    const q = query(
      collection(db, CategoryRepository.collectionName),
      where("id", "in", categoriesIds)
    );

    const snapshot = await getDocs(q);
    snapshot.forEach(doc => categories.push(CategoryMapper.fromDTO({ id: doc.id, ...doc.data() })));

    return categories;
  },

};
