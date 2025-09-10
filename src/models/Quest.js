// Domain class
export class Quest {
  constructor({ 
    id = crypto.randomUUID(),
    userId,
    motherGoalsFks,
    name = "",
    startEstimate = null,
    hoursRange = [1, 2],
    deadline,
    hoursSpent = 0,
    done = false,
    difficulty = 5,
    comment = "",
  } = {}) {
    this.id = id;
    this.userId = userId;
    this.motherGoalsFks = motherGoalsFks;
    this.name = name;
    this.startEstimate = startEstimate ? new Date(startEstimate) : new Date();
    this.hoursRange = hoursRange;
    this.deadline = deadline ? new Date(deadline) : new Date(this.startEstimate + 3600000 * (  1 + this.hoursRange[1])); // default deadline 1 hour after estimated end time
    this.hoursSpent = hoursSpent;
    this.done = done;
    this.difficulty = difficulty; // scale of 1-10
    this.comment = comment;
  }

}