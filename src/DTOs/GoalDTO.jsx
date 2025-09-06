
export const createGoalDTO = ({
  id = crypto.randomUUID(),
  userId,
  name = "",
  categoriesFKs = "",
  deadline = "",
  startEstimate = "",
  hoursEstimate = 0,
  hoursSpent = 0,
  done = false,
  difficulty = 5,
  comment = "",
  tasksCoverFKs = []
} = {}) => {
  return {
    id,
    userId,
    name,
    categoriesFKs,
    deadline,
    startEstimate,
    hoursEstimate,
    hoursSpent,
    done,
    difficulty,
    comment,
    tasksCoverFKs
  };
};
