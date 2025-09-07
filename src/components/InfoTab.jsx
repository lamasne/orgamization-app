import { useEffect, useState } from "react";
import { collection, getDocs, setDoc, doc } from "firebase/firestore";
import { db } from "../config/firebase-config";


const fundamentalCategoriesData = [
  { id: "1", name: "Source of income" },
  { id: "2", name: "Resource management", desc: "Buy, repair, clean, consume items such as food and furniture." },
  { id: "3", name: "Social relationships", desc: "Lover, sexual partner, friend/family, public image" },
  { id: "4", name: "Mental improvement and maintenance", desc: "Mental improvement and maintenance (e.g. learning, problem-solving), fantasize (e.g., dreaming, reading, movies), videogames, meditating" },
  { id: "5", name: "Physical activity", desc: "Body improvement and maintenance, dance, sex, sport, massages" }
];

// // Code to fetch and print a JSON representation of the fundamentalCategories collection - used to create a backup of it
// const fetchAndGenerateCode = async () => {
//   try {
//     const snapshot = await getDocs(collection(db, "fundamentalCategories"));
//     const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//     console.log("const fundamentalCategoriesData = ", JSON.stringify(data, null, 2), ";");
//   } catch (err) {
//     console.error(err);
//   }
// };

export default function InfoTab() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchOrPopulateCategories = async () => {
      try {
        const snapshot = await getDocs(collection(db, "fundamentalCategories"));
        if (snapshot.empty) {
          console.log("Collection empty, creating default categories...");
          for (const cat of fundamentalCategoriesData) {
            await setDoc(doc(db, "fundamentalCategories", cat.id), cat);
          }
          setCategories(fundamentalCategoriesData);
        } else {
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setCategories(data);
        }
      } catch (err) {
        console.error("Error fetching or creating categories:", err);
      }
    };

    fetchOrPopulateCategories();
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">

      <h1 className="text-3xl font-bold mb-6">Gamifying Organization</h1>

      {/* <h2 className="text-2xl font-bold mb-4">Instructions</h2> */}

      <h2 className="text-2xl font-bold mb-4">Activities and Goals</h2>

      <p className="mb-4">
        After realizing that all my activities are planned based on optimizing my
        pleasure/pain ratio (cf. <span className="italic">The Method</span>), the
        pleasurable experiences one can have are triggered by their nervous system
        interacting with objects. I chose to split these stimuli into 3 categories:
      </p>

      <ul className="list-disc list-inside mb-4">
        <li>Objects</li>
        <li>Human beings</li>
        <li>Myself</li>
      </ul>

      <p className="mb-4">
        In current society, access to objects mostly means earning enough money. Since
        it is essential at short-term (e.g. food and a home) and typically takes about
        half of one's weekly activity, a whole section called{" "}
        <span className="font-semibold">source of income</span> is dedicated to it.
      </p>

      <p className="mb-4">
        The other part of activities relating to objects is the management of resources
        comprising:
      </p>

      <ul className="list-disc list-inside mb-4 ml-4">
        <li>Their use (to experience pleasure), aka leisure</li>
        <li>Their exchange</li>
        <li>Their maintenance</li>
      </ul>

      <p className="mb-6">
        This is implemented in the <span className="font-semibold">Personal</span>{" "}
        section, along with the planning of interactions with the other categories,
        i.e., human beings, body, and mind.
      </p>

      <div className="p-6 max-w-3xl mx-auto">
        <h2 className="text-xl font-semibold mb-2">
          Fundamental Activity Categories
        </h2>
        <ul>
          {categories.map(cat => (
            <li key={cat.id}>{cat.name} {cat.desc && `- ${cat.desc}`}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
