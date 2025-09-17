export class QuestCategory {
   constructor({
     id = crypto.randomUUID(),
     name = "",
     desc = "",
   } = {}) {
     this.id = id;
     this.name = name;
     this.desc = desc;
   }
}