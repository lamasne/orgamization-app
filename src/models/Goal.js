export class Goal {
  constructor({
    id = crypto.randomUUID(),
    userId,
    name,
    categoriesFks = [],
    deadline = new Date(Date.now() + 7 * 24 * 3600000), // default deadline one week from now
    done = false,
    comment = "",
  } = {}) {
    this.id = id;
    this.userId = userId;
    this.name = name;
    this.categoriesFks = categoriesFks;
    this.deadline = deadline;
    this.done = done;
    this.comment = comment;
  }

}