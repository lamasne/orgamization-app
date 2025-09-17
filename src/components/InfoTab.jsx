import { useEffect, useState } from "react";
import { questCategoryRepository } from "../repositories/QuestCategoryRepository";
import { QuestCategory } from "../models/QuestCategory";

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

export default function InfoTab({user}) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchOrPopulateCategories = async () => {
      try {
        const categories = await questCategoryRepository.findAll();
        if (categories.length === 0) {
          const ok = window.confirm(
            "Collection is empty. Do you want to create the default categories?"
          );
          if (!ok) return; // user cancelled
        
          console.log("Creating default categories...");
          for (const cat of fundamentalCategoriesData) {
            const questCategory = new QuestCategory(cat);
            await questCategoryRepository.save(user.uid, questCategory);
          }
          setCategories(fundamentalCategoriesData);
        } else {
          setCategories(categories);
        }
      } catch (err) {
        console.error("Error fetching or creating categories:", err);
      }
    };

    fetchOrPopulateCategories();
  }, [user]);

  return (
    <div className="p-6 max-w-3xl mx-auto">

      <h2 className="text-3xl font-bold mb-6">Gamifying Organization</h2>

      <h3 className="text-2xl font-bold mb-4">Why this application?</h3>
      <p className="mb-4">
        I hypothesize that living beings' goal is to maximize their pleasure/pain ratio (cf. <span className="italic">The Method</span>)
        The goal of this application is to improve my policy (i.e. strategy) towards this goal. 
        To do so, I want to continuously determine the best plan of action possible and execute it. This application helps regarding both parts:
      </p>
      <ul>
        <li>Determination of the best plan of action possible: e.g., through goal identification & decomposition</li>
        <li>Execution of the plan: e.g., via gamification, visualization-based motivation</li>
      </ul>

      {/* <h3 className="text-2xl font-bold mb-4">Instructions</h3> */}

      <h3 className="text-2xl font-bold mb-4">Activities and Goals</h3>

      <p className="mb-4">
        I make the hypothesis that pleasurable experiences are associated with nervous system (NS) activity.
        I classify the nervous system's potential sources of stimulation into three categories:
      </p>
      <ul className="list-disc list-inside mb-4">
        <li>Other human beings</li>
        <li>Own body</li>
        <li>Rest of environment</li>
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
        <h3 className="text-xl font-semibold mb-2">
          Fundamental Activity Categories
        </h3>
        <ul>
          {categories.map(cat => (
            <li key={cat.id}>{cat.name} {cat.desc && `- ${cat.desc}`}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
