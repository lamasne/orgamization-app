import { User } from "../models/User";
import { ItemRepository } from "./ItemRepository";

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

export const UserRepository = new ItemRepository("users", UserMapper);