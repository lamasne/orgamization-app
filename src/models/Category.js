export class Category {
   constructor({
     id = crypto.randomUUID(),
     name,
     desc = "",
   } = {}) {
     this.id = id;
     this.name = name;
     this.desc = desc;
   }
}