

export const createQuestDTO = ({
  id=crypto.randomUUID(),
  userId,
  name = "",
  deadline = "",
  startEstimate = "",
  hoursEstimate = 0,
  hoursSpent = 0,
  done = false,
  difficulty = 5,
  comment = "",
  childrenTasksFKs = []
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
  childrenTasksFKs
});
