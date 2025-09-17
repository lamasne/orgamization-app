import { User } from "../models/User";
import { CommonRepository } from "./CommonRepository";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../config/firebase-config";

// Mapper
export const UserMapper = {
  fromDTO: (doc) => new User({
    uid: doc.id,
    firstName: doc.firstName || "",
    lastName: doc.lastName || "",
    email: doc.email || "",
  }),
  toDTO: (user) => ({
    uid: user.uid,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
  })
};

class UserRepository extends CommonRepository {
  constructor() {
    super("users", UserMapper);
  }

  async save(uid, user) {
    if (!uid) {
      console.error("No uid provided for user save");
      return;
    }
    if (!user) {
      console.error("No user model provided");
      return;
    }

    const ref = doc(db, this.collectionName, uid);
    const dto = { ...this.mapper.toDTO(user), uid };

    console.log("Saving user", dto, "to collection:", this.collectionName);

    await setDoc(ref, dto, { merge: true });
  }
}

export const userRepository = new UserRepository();