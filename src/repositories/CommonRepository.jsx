import { doc, getDocs, setDoc, deleteDoc, query, collection, where, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase-config";

export class CommonRepository {
   constructor(collectionName, mapper) {
     this.collectionName = collectionName;
     this.mapper = mapper;
   }
 
   // Find all items for a user
   async findAllByUser(userId) {
    if (!userId){
      console.error("No user id provided");
      return null;
    }
    const q = query(collection(db, this.collectionName), where("userId", "==", userId));
    const snap = await getDocs(q);
    return snap.docs.map(docSnap => this.mapper.fromDTO({ id: docSnap.id, ...docSnap.data() }));
    }

   // Find items with the given field and value
   async findByUserAndField(userId, field, value) {
    if (!userId || !value){
      console.error("No user id or value provided");
      return null;
    }
    const q = query(
      collection(db, this.collectionName), 
      where("userId", "==", userId), 
      where(field, "==", value)
    );
    const snap = await getDocs(q);
    return snap.docs.map(docSnap => this.mapper.fromDTO({ id: docSnap.id, ...docSnap.data() }));
   }
 
  /**
   * Subscribes to real-time updates of items with the given field and value.
   * Calls input `callback` with an array of Item objects whenever the data changes.
   * Returns an unsubscribe function to stop listening (useful for cleanup in React components through useEffect)
   */
   onFieldChange(field, value, callback) {
    if (!value){
      console.error("No value provided");
      return () => {};
    }
     const q = query(collection(db, this.collectionName), where(field, "==", value));
     const unsubscribe = onSnapshot(q, (snapshot) => {
       const items = snapshot.docs.map(docSnap => this.mapper.fromDTO({ id: docSnap.id, ...docSnap.data() }));
       callback(items);
     });
     return unsubscribe;
   }
 
   // Save an item to the database
   async save(userId, item) {
    console.log("Saving", this.mapper.toDTO(item), "to collection: '", this.collectionName, "' as requested by user", userId);
    if (!item?.id){
      console.error("No id provided");
      return;
    }
    if (item.userId && item.userId !== userId){
      console.error("User id does not match");
      return;
    }
    const ref = doc(db, this.collectionName, item.id);
    await setDoc(ref, this.mapper.toDTO(item), { merge: true });
  }
 
   // Delete multiple items from the database
   async deleteMany(userId, ids) {
    console.log("Deleting items", ids, "from collection: '", this.collectionName, "' as requested by user", userId);
    if (!ids?.length){
      console.error("No ids provided");
      return;
    }
    const deletes = ids.map(id => deleteDoc(doc(db, this.collectionName, id)));
    await Promise.all(deletes);
   }
 }
 