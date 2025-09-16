
import { SessionRepository } from "../repositories/SessionRepository";

// Domain class
export class Quest {
  constructor({ 
    id = crypto.randomUUID(),
    userId,
    isSubQuest = false,
    motherQuestsFks,
    name,
    hoursRange = [1, 2],
    deadline,
    progressMetricsName = "hoursSpent",
    progressMetricsValue = null,
    difficulty = 5,
    comment = "",
  } = {}) {
    this.id = id;
    this.userId = userId;
    this.isSubQuest = isSubQuest;
    this.motherQuestsFks = motherQuestsFks;
    this.name = name;
    this.hoursRange = hoursRange;
    this.deadline = deadline ? new Date(deadline) : new Date(Date.now() + 3600000 * ( this.hoursRange[1] + 1));
    this.difficulty = difficulty; // scale of 1-10
    this.comment = comment;
    this.progressMetricsName = progressMetricsName;
    this.progressMetricsValue = progressMetricsValue;
  }

  async getCurrentProgress() {
    const sessions = await SessionRepository.findByField("userId", this.userId);
    const relevant_sessions = sessions.filter(
      s => (s.motherQuestsFKs || []).includes(this.id) && s.isDone
    );
    return relevant_sessions.reduce((total, session) => {
      return total + session.associatedProgress;
    }, 0);
  }

  get isDone() {
    return this.progressMetricsValue >= this.getCurrentProgress();
  }

}