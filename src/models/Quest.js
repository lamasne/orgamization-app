// Domain class
export class Quest {
  constructor({ 
    id = crypto.randomUUID(),
    userId,
    motherGoalsFKs,
    name = "",
    startEstimate = null,
    hoursEstimate = [1, 2],
    deadline,
    hoursSpent = 0,
    done = false,
    difficulty = 5,
    comment = "",
  } = {}) {
    this.id = id;
    this.userId = userId;
    this.motherGoalsFKs = motherGoalsFKs;
    this.name = name;
    this.startEstimate = startEstimate ? new Date(startEstimate) : new Date();
    this.hoursEstimate = hoursEstimate;
    this.deadline = deadline ? new Date(deadline) : new Date(this.startEstimate + 3600000 * (  1 + this.hoursEstimate[1])); // default deadline 1 hour after estimated end time
    this.hoursSpent = hoursSpent;
    this.done = done;
    this.difficulty = difficulty; // scale of 1-10
    this.comment = comment;
  }

  // Example domain logic
  isCompleted() {
    return this.status === "completed";
  }
}