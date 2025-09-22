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
          <div className="expanded-card-prop">
            Mother Quest:{" "}
            {q.motherQuestsFks?.length > 0
              ? q.motherQuestsFks
                  .map((id) =>
                    q.isSubQuest
                      ? manager.allMotherQuestsMap[id]?.name
                      : manager.allMotherCategoriesMap[id]?.name ?? id
                  )
                  .join(", ")
              : "No mother items"}
          </div>
          {q.progressMetricsName && q.progressMetricsValue && (
            <div className="expanded-card-prop">
              Progress:{" "}
              <em>
                <span>
                  {q.progressMetricsName}: {q?.currentProgress}/
                  {q.progressMetricsValue}
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

      {isQuestInForm && <p>Quest Form TODO</p>}

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
