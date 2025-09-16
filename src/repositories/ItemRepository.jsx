import { doc, getDocs, setDoc, deleteDoc, query, collection, where, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase-config";

export class ItemRepository {
   constructor(collectionName, mapper) {
     this.collectionName = collectionName;
     this.mapper = mapper;
   }
 
   // Find all items
   async findAll() {
      const snap = await getDocs(collection(db, this.collectionName));
      return snap.docs.map(docSnap => this.mapper.fromDTO({ id: docSnap.id, ...docSnap.data() }));
    }

   // Find items with the given field and value
   async findByField(field, value) {
     if (!value) return [];
     const q = query(collection(db, this.collectionName), where(field, "==", value));
     const snap = await getDocs(q);
     return snap.docs.map(docSnap => this.mapper.fromDTO({ id: docSnap.id, ...docSnap.data() }));
   }
 
  /**
   * Subscribes to real-time updates of items with the given field and value.
   * Calls input `callback` with an array of Item objects whenever the data changes.
   * Returns an unsubscribe function to stop listening (useful for cleanup in React components through useEffect)
   */
   onFieldChange(field, value, callback) {
     if (!value) return () => {};
     const q = query(collection(db, this.collectionName), where(field, "==", value));
     const unsubscribe = onSnapshot(q, (snapshot) => {
       const items = snapshot.docs.map(docSnap => this.mapper.fromDTO({ id: docSnap.id, ...docSnap.data() }));
       callback(items);
     });
     return unsubscribe;
   }
 
   // Save an item to the database
   async save(userId, item) {
    console.log("Saving item", this.mapper.toDTO(item), "for user", userId);
    if (!item?.id) return;                  // always require an id
    if (item.userId && item.userId !== userId) return;  // only enforce if userId is present
    const ref = doc(db, this.collectionName, item.id);
    await setDoc(ref, this.mapper.toDTO(item), { merge: true });
  }
 
   // Delete multiple items from the database
   async deleteMany(userId, ids) {
    console.log("Request to delete items", ids, "by user", userId);
     if (!ids?.length) return;
     const deletes = ids.map(id => deleteDoc(doc(db, this.collectionName, id)));
     await Promise.all(deletes);
   }
 }
 