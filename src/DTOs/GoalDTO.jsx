
export const createGoalDTO = ({
  id = crypto.randomUUID(),
  userId,
  name = "",
  categoriesFKs = "",
  deadline = "",
  done = false,
  comment = "",
} = {}) => {
  return {
    id,
    userId,
    name,
    categoriesFKs,
    deadline,
    done,
    comment,
  };
};
