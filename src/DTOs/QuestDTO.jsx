

export const createQuestDTO = ({
  id=crypto.randomUUID(),
  userId,
  name = "",
  startEstimate = Date.now(),
  hoursEstimate = [1,2], // range in hours
  deadline = startEstimate + 3600000 * (  1 + hoursEstimate[1]), // default deadline 1 hour after estimated end time
  hoursSpent = 0,
  done = false,
  difficulty = 5,
  comment = "",
  motherGoalsFKs = []
} = {}) => ({
  id,
  userId,
  name,
  deadline,
  startEstimate,
  hoursEstimate,
  hoursSpent,
  done,
  difficulty,
  comment,
  motherGoalsFKs
});
