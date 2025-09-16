import admin from "firebase-admin";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccount = JSON.parse(
  readFileSync(path.join(__dirname, "serviceAccountKey.json"), "utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

export const db = admin.firestore();

export async function renameCollection(oldName, newName) {
  const oldSnap = await db.collection(oldName).get();

  for (const doc of oldSnap.docs) {
    const data = doc.data();
    await db.collection(newName).doc(doc.id).set(data);
    await db.collection(oldName).doc(doc.id).delete();
  }

  console.log(`Renamed ${oldName} → ${newName}`);
}

export async function renameFieldInSessions(collectionName, oldFieldName, newFieldName) {
   const snap = await db.collection(collectionName).get();
 
   for (const doc of snap.docs) {
     const data = doc.data();
 
     if (oldFieldName in data) {
       data[newFieldName] = data[oldFieldName];
       delete data[oldFieldName];
       await db.collection(collectionName).doc(doc.id).set(data);
     }
   }
 
   console.log(`Renamed field ${oldFieldName} → ${newFieldName} in ${collectionName}`);
 }