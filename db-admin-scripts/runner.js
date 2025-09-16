// Run with: node .\db-admin-scripts\runner.js

import { renameCollection, renameFieldInSessions } from "./firebaseUtils.js";

// renameCollection("fundamentalCategories", "questCategories")
//   .then(() => process.exit(0))
//   .catch(err => { console.error(err); process.exit(1); });

renameFieldInSessions("sessions", "motherGoalsFks", "motherQuestsFks")
  .then(() => process.exit(0))
  .catch(err => { console.error(err); process.exit(1); });

