import { db } from "../config/firebase-config";
import { doc } from "firebase/firestore";
import { collectionName } from "../services/questService";


export const createQuestDTO = ({
  user,
  id = doc(db, collectionName, user.uid).id,   // Firestore-generated unique ID
  name = "",
  deadline = "",
  startEstimate = "",
  hoursEstimate = 0,
  hoursSpent = 0,
  done = false,
  difficulty = 5,
  comment = "",
  childrenTasksFKs = []
} = {}) => ({
  id,
  name,
  deadline,
  startEstimate,
  hoursEstimate,
  hoursSpent,
  done,
  difficulty,
  comment,
  childrenTasksFKs
});
