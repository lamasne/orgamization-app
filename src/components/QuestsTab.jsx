import { useState, useCallback } from "react";
import React from "react";
import { Quest } from "../models/Quest";
import useQuestTabManager from "../hooks/useQuestTabManager.jsx";

export default function QuestsTab({ user }) {
  const [pendingQuests, setPendingQuests] = useState([]);
  const [completedQuests, setCompletedQuests] = useState([]);

  const [questInForm, setQuestInForm] = useState(null);
  const isQuestInForm = questInForm !== null;

  const [expandedQuestId, setExpandedQuestId] = useState(null);
  const [isShowCompletedItems, setIsShowCompletedItems] = useState(false);
  const [allMotherQuestsMap, setAllMotherQuestsMap] = useState({});
  const [allMotherCategoriesMap, setAllMotherCategoriesMap] = useState({});

  const manager = useQuestTabManager({
    user,
    setPendingQuests,
    setCompletedQuests,
    allMotherQuestsMap,
    setAllMotherQuestsMap,
    allMotherCategoriesMap,
    setAllMotherCategoriesMap,
  });

  const QuestForm = () => {
    const [name, setName] = useState(questInForm?.name || "");
    const [motherQuestsFks, setMotherQuestsFks] = useState(questInForm?.motherQuestsFks || []);
    const [isSubQuest, setIsSubQuest] = useState(questInForm?.isSubQuest || false);
    let mainMotherQuest = null;
    if (motherQuestsFks?.length) {
      if (isSubQuest) {
        mainMotherQuest = allMotherQuestsMap[motherQuestsFks[0]] || null;
      }
      else {
        mainMotherQuest = allMotherCategoriesMap[motherQuestsFks[motherQuestsFks.length - 1]] || null;
      }
    }
    const [progressMetricsName, setProgressMetricsName] = useState(questInForm?.progressMetricsName || "");
    const [progressMetricsValue, setProgressMetricsValue] = useState(questInForm?.progressMetricsValue || 0);
    const [deadline, setDeadline] = useState(
      questInForm?.deadline
        ? manager.toDateTimeLocalString(new Date(questInForm.deadline))
        : ""
    );

    const finishAddEdit = () => {
      setQuestInForm(null);
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      const item = new Quest({
        ...(questInForm?.id !== null && { id: questInForm.id }),
        userId: user.uid,
        name,
        motherQuestsFks,
        isSubQuest,
        progressMetricsName,
        progressMetricsValue,
        deadline,
      });
      await manager.save(item);
      finishAddEdit();
    };

    return questInForm ? (
      <form onSubmit={handleSubmit} className="form-card">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Quest name"
          required
        />

        <label>
          <input
            type="checkbox"
            checked={isSubQuest}
            onChange={() => setIsSubQuest(!isSubQuest)}
          />
          Is subquest
        </label>

        <select
          multiple
          value={motherQuestsFks}
          onChange={(e) => setMotherQuestsFks(Array.from(e.target.selectedOptions, (o) => o.value))}
        >
          {isSubQuest ? (
            Object.entries(allMotherQuestsMap).map(([id, mainMotherQuest]) => (
              <option key={id} value={id}>
                {mainMotherQuest.name}
              </option>
            ))
          ) : (
            Object.entries(allMotherCategoriesMap).map(([id, motherCategory]) => (
              <option key={id} value={id}>
                {motherCategory.name}
              </option>
            ))
          )}
        </select>

        <input
          type="text"
          value={progressMetricsName}
          onChange={(e) => setProgressMetricsName(e.target.value)}
          placeholder={
            isSubQuest 
            ? (mainMotherQuest?.progressMetricsName || "hoursSpent") 
            : "hoursSpent"
          }
        />

        <input
          type="number"
          value={progressMetricsValue}
          onChange={(e) => setProgressMetricsValue(e.target.value)}
          placeholder={
            isSubQuest && mainMotherQuest?.progressMetricsName == progressMetricsName
            ? `Choose a quantity of ${progressMetricsName} up to ${mainMotherQuest.progressMetricsValue}`
            : `Choose a quantity of ${progressMetricsName}`
          }
        />

        <input
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />

        <button type="submit" className="button primary">
          {questInForm.id ? "Save changes" : "Add"}
        </button>
        <button type="button" className="button" onClick={finishAddEdit}>
          Cancel
        </button>
      </form>
    ) : (
      <p>No item in form</p>
    );
  };

  const renderExpandedQuestCard = useCallback(
    (q) => {

      return (
        <div
          className="card"
          onClick={() => setExpandedQuestId(null)}
          style={{ cursor: "pointer" }}
        >
          <div>
            <div className="card-title expanded-card-prop">{q.name}</div>
            <div className="expanded-card-prop">
              Mother Quest:{" "}
              {q.motherQuestsFks?.length > 0
                ? q.motherQuestsFks
                    .map((id) =>
                      q.isSubQuest
                        ? allMotherQuestsMap[id]?.name
                        : allMotherCategoriesMap[id]?.name ?? id
                    )
                    .join(", ")
                : "No mother items"}
            </div>
            {q.progressMetricsName && q.progressMetricsValue && (
              <div className="expanded-card-prop">
                Progress:{" "}
                <em>
                  {/* useEffect could preload this, but you can also fetch inline */}
                  {/* Wrap in Suspense or prefetch in manager for better UX */}
                  <span>{q.progressMetricsName}: {q?.currentProgress}/{q.progressMetricsValue} </span>
                </em>
              </div>
            )}
            <div className="expanded-card-prop">Deadline: {manager.formatDate(q.deadline)}</div>
          </div>
          {manager.renderCardButtons(q, { isFormOpen: isQuestInForm, setFormItem: setQuestInForm })}
        </div>
    );
    },
    [allMotherQuestsMap, allMotherCategoriesMap, manager]
  );

  const renderQuestCard = useCallback(
    (q) => (
      <div
        className="card"
        onClick={() => setExpandedQuestId(q.id)}
        style={{ cursor: "pointer" }}
      >
        <span className="card-text">
          {q.name}
          {q.progressMetricsName && q.progressMetricsValue && (
            <>
              <span className="card-splitter">✦</span>
              <span>{q.progressMetricsName}: {q.currentProgress}/{q.progressMetricsValue}</span>
            </>
          )}
          <span className="countdown">
            <manager.Countdown deadline={q.deadline} />
          </span>        
        </span>
        {manager.renderCardButtons(q, { isFormOpen: isQuestInForm, setFormItem: setQuestInForm })}
      </div>
    ),
    [allMotherQuestsMap, allMotherCategoriesMap, manager]
  );

  const renderSubQuestCard = useCallback(
    (q) => (
      <div
        className="sub-card"
      >
        <span className="card-text">
          {q.name}
          {q.progressMetricsName && q.progressMetricsValue && (
            <>
              <span className="card-splitter">✦</span>
              <span>{q.progressMetricsName}: {q.currentProgress}/{q.progressMetricsValue}</span>
            </>
          )}
          <span className="countdown">
            <manager.Countdown deadline={q.deadline} />
          </span>            
        </span>
        {manager.renderCardButtons(q, { isFormOpen: isQuestInForm, setFormItem: setQuestInForm })}
      </div>
    ),
    [allMotherQuestsMap, allMotherCategoriesMap, manager]
  );



  return (
    <>
      <h2 style={{ marginBottom: "0.5rem" }}>Pending</h2>
      {pendingQuests.length === 0 && (
        <p>No pending quests. Add your next quest!</p>
      )}
      <ul>
        {pendingQuests.map((q) =>
          !q.isSubQuest ? (
            expandedQuestId === q.id ? (
              <li key={q.id} className="card-li">
                {renderExpandedQuestCard(q)}
                <ul className="sub-quests">
                  {pendingQuests
                    .filter(subQuest => subQuest.motherQuestsFks.includes(q.id))
                    .map(subQuest => (
                      <li key={subQuest.id}>
                        {renderSubQuestCard(subQuest)}
                      </li>
                    ))}
                </ul>
              </li>
            ) : (
              <li key={q.id} className="card-li">
                {renderQuestCard(q)}
              </li>
            )
          ) : null
        )}
      </ul>


      {isQuestInForm && <QuestForm/>}

      <div className="row-buttons">
        {!isQuestInForm && (
          <button className="button" onClick={() => setQuestInForm(new Quest())}>
            + Add Quest
          </button>
        )}
        <button
          className="button"
          onClick={() => setIsShowCompletedItems(!isShowCompletedItems)}
        >
          {isShowCompletedItems ? "Hide Completed Items" : "See Completed Items"}
        </button>
      </div>

      {isShowCompletedItems && (
        <>
          <h2>Completed</h2>
          <ul>
            {completedQuests.map((q) => (
              <li key={q.id} className="card-li">
                {renderQuestCard(q)}
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
