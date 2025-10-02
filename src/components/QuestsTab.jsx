import { useState, useCallback } from "react";
import React from "react";
import { Quest } from "../models/Quest";
import useQuestTabManager from "../hooks/useQuestTabManager.jsx";


export default function QuestsTab({ user }) {
  const [questInForm, setQuestInForm] = useState(null);
  const isQuestInForm = questInForm !== null;
  const [isShowCompletedItems, setIsShowCompletedItems] = useState(false);

  const manager = useQuestTabManager();

  // ------------------------
  // QUEST FORM
  // ------------------------

  const QuestForm = () => {
    const [name, setName] = useState(questInForm?.name || "");
    const [motherQuestsFks, setMotherQuestsFks] = useState(questInForm?.motherQuestsFks || []);
    const [isSubQuest, setIsSubQuest] = useState(questInForm?.isSubQuest || false);
    let mainMotherQuest = null;
    if (motherQuestsFks?.length) {
      if (isSubQuest) {
        mainMotherQuest = manager.allMotherQuestsMap[motherQuestsFks[0]] || null;
      }
      else {
        mainMotherQuest = manager.allMotherCategoriesMap[motherQuestsFks[motherQuestsFks.length - 1]] || null;
      }
    }
    const [progressMetricsName, setProgressMetricsName] = useState(questInForm?.progressMetricsName || null);
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
            Object.entries(manager.allMotherQuestsMap).map(([id, mainMotherQuest]) => (
              <option key={id} value={id}>
                {mainMotherQuest.name}
              </option>
            ))
          ) : (
            Object.entries(manager.allMotherCategoriesMap).map(([id, motherCategory]) => (
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

  // ------------------------
  // RENDER HELPERS
  // ------------------------
  const renderExpandedQuestCard = useCallback(
    (q) => (
      <div
        className="card"
        onClick={() => manager.toggleExpand(q.id)}
        style={{ cursor: "pointer" }}
      >
        <div>
          <div className="card-title expanded-card-prop">{q.name}</div>
          {!q.isSubQuest ? (
            <div className="expanded-card-prop">
              Mother Quest:{" "}
              {q.motherQuestsFks?.length > 0
                ? q.motherQuestsFks
                    .map((id) => manager.allMotherCategoriesMap[id]?.name ?? id)
                    .join(", ")
                : "No mother items"}
            </div>
          ) : (
            q.motherQuestsFks?.length > 1 && (
              <div className="expanded-card-prop">
                Mother Quests:{" "}
                {q.motherQuestsFks
                  .map((id) => manager.allMotherQuestsMap[id]?.name ?? id)
                  .join(", ")}
              </div>
            )
          )}

          {q.progressMetricsName && q.progressMetricsValue && (
            <div className="expanded-card-prop">
              Progress:{" "}
              <em>
                <span>
                  {q?.currentProgress}/{q.progressMetricsValue} {q.progressMetricsName}
                </span>
              </em>
            </div>
          )}
          <div className="expanded-card-prop">
            Deadline: {manager.formatDate(q.deadline)}
          </div>
        </div>
        {manager.renderCardButtons(q, {
          isFormOpen: isQuestInForm,
          setFormItem: setQuestInForm,
        })}
      </div>
    ),
    [manager]
  );

  const renderQuestCard = useCallback(
    (q, isSubQuest) => (
      <div
        className={isSubQuest ? "sub-card" : "card"}
        onClick={() => manager.toggleExpand(q.id)}
        style={{ cursor: "pointer" }}
      >
        <span className="card-text">
          {q.name}
          {q.progressMetricsName && q.progressMetricsValue && (
            <>
              <span className="card-splitter">✦</span>
              <span>
                {q.progressMetricsName}: {q.currentProgress}/
                {q.progressMetricsValue}
              </span>
            </>
          )}
          <span className="countdown">
            <manager.Countdown deadline={q.deadline} />
          </span>
        </span>
        {manager.renderCardButtons(q, {
          isFormOpen: isQuestInForm,
          setFormItem: setQuestInForm,
        })}
      </div>
    ),
    [manager]
  );

  // Recursive tree
  const renderQuestTree = (quest) => {
    const isExpanded = manager.expandedQuestIds.includes(quest.id);
    const children = manager.pendingQuests.filter((sub) =>
      sub.motherQuestsFks.includes(quest.id)
    );

    return (
      <li key={quest.id} className="card-li">
        {isExpanded ? renderExpandedQuestCard(quest) : renderQuestCard(quest, quest.isSubQuest)}
        {isExpanded && children.length > 0 && (
          <ul className="sub-quest">
            {children.map((child) => renderQuestTree(child))}
          </ul>
        )}
      </li>
    );
  };

  // ------------------------
  // RETURN
  // ------------------------
  return (
    <>
      <h2 style={{ marginBottom: "0.5rem" }}>Pending</h2>

      {manager.pendingQuests.length === 0 ? (
        <p>No pending quests. Add your next quest!</p>
      ) : (
        <ul>
          {manager.pendingQuests
            .filter((q) => !q.isSubQuest)
            .map((rootQuest) => renderQuestTree(rootQuest))}
        </ul>
      )}

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
            {manager.completedQuests.map((q) => (
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
