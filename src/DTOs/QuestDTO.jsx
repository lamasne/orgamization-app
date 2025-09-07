

export const createQuestDTO = ({
  id=crypto.randomUUID(),
  userId,
  motherGoalsFKs,
  name = "",
  startEstimate = Date.now(),
  hoursEstimate = [1,2], // range in hours - within a range 2^n to 2^{n+1} with n natural (easier to estimate quickly)
  deadline = startEstimate + 3600000 * (  1 + hoursEstimate[1]), // default deadline 1 hour after estimated end time
  hoursSpent = 0,
  done = false,
  difficulty = 5,
  comment = "",
} = {}) => ({
  id,
  userId,
  motherGoalsFKs,
  name,
  deadline,
  startEstimate,
  hoursEstimate,
  hoursSpent,
  done,
  difficulty,
  comment,
});
