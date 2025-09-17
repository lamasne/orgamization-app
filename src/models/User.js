export class User {
   constructor({
     uid = crypto.randomUUID(),
     firstName = "",
     lastName = "",
     email = "",
   } = {}) {
     this.uid = uid;
     this.firstName = firstName;
     this.lastName = lastName;
     this.email = email;
   }
}