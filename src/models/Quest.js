
import { SessionRepository } from "../repositories/SessionRepository";

// Domain class
export class Quest {
  constructor({ 
    id = crypto.randomUUID(),
    userId = "",
    isSubQuest = false,
    motherQuestsFks = [],
    name = "",
    deadline = Date.now() + 24 * 60 * 60 * 1000,
    progressMetricsName = "estimated completion percentage",
    progressMetricsValue = 100,
    difficulty = 5,
    comment = "",
  } = {}) {
    this.id = id;
    this.userId = userId;
    this.isSubQuest = isSubQuest;
    this.motherQuestsFks = motherQuestsFks;
    this.name = name;
    this.deadline = new Date(deadline);
    this.difficulty = difficulty; // scale of 1-10
    this.comment = comment;
    this.progressMetricsName = progressMetricsName;
    this.progressMetricsValue = progressMetricsValue;
  }

  async getCurrentProgress() {
    const sessions = await SessionRepository.findByUserAndField(this.userId, "userId", this.userId);
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