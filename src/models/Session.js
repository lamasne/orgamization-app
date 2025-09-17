
import { QuestRepository } from "../repositories/QuestRepository";

export class Session {
  #associatedProgress; // private backing field

   constructor({
     id = crypto.randomUUID(),
     userId = "",
     name = "",
     motherQuestsFks = [],
     associatedProgress = 0,
     start= Date.now(),
     end= Date.now() + 2 * 60 * 60 * 1000, // default end time 2 hours from start time
     recurrence = null, // null if not recurring, otherwise a time interval 
     status = "pending", // "pending", "in-progress", "completed"
     comment = "",
   } = {}) {
     this.id = id;
     this.userId = userId;
     this.name = name;
     this.motherQuestsFks = motherQuestsFks;
     this.#associatedProgress = associatedProgress;
     this.start = new Date(start);
     this.end = new Date(end);
     this.recurrence = recurrence;
     this.status = status;
     this.comment = comment;
   }
 
   // If the first motherQuestsFK has progressMetricsName="hoursSpent", return the associated progress, otherwise return associatedProgress passed to constructor
   get associatedProgress() {
    if (!this.userId || this.motherQuestsFks.length === 0) return this.#associatedProgress;
    if (QuestRepository.findByUserAndField(
        this.userId, "id", this.motherQuestsFks[0]
      )?.progressMetricsName === "hoursSpent") {
      return (this.end - this.start) / (1000 * 60); // in minutes
    } 
    return this.#associatedProgress;
  }

  get isDone() {
    return this.status === "completed";
  }
}