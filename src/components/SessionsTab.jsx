import { SessionRepository } from "../repositories/SessionRepository";
import { QuestRepository } from "../repositories/QuestRepository";
import { Session } from "../models/Session";
import { Quest } from "../models/Quest";
import { useState, useCallback } from "react";
import useSessionTabManager from "../hooks/useSessionTabManager";

export default function SessionsTab({user}) {
  const [pendingSessions, setPendingSessions] = useState([]);
  const [completedSessions, setCompletedSessions] = useState([]);

  const [sessionInForm, setSessionInForm] = useState(null);
  const isSessionInForm = sessionInForm !== null;

  const [expandedSessionId, setExpandedSessionId] = useState(null);
  const [isShowCompletedSessions, setIsShowCompletedSessions] = useState(false);
  const [allMotherQuestsMap, setAllMotherQuestsMap] = useState({});

  const manager = useSessionTabManager({
    user,
    setPendingSessions,
    setCompletedSessions,
    allMotherQuestsMap,
    setAllMotherQuestsMap
  });
  
  const SessionForm = () => {
    const [name, setName] = useState(sessionInForm?.name || "");
    const [motherQuestsFks, setMotherQuestsFks] = useState(sessionInForm?.motherQuestsFks || []);
    const mainMotherQuest = allMotherQuestsMap[motherQuestsFks[0]];
    const [associatedProgress, setAssociatedProgress] = useState(sessionInForm?.associatedProgress || 0);
    const [start, setStart] = useState(sessionInForm?.start || "");
    const [end, setEnd] = useState(sessionInForm?.end || "");

    const finishAddEdit = () => {
      setSessionInForm(null);
    };

    const handleSubmit = async (e) => {
      console.log("user", user.uid, "Will update/save session", sessionInForm?.name, "with", name, motherQuestsFks, associatedProgress);
      e.preventDefault();
      const session = new Session({ 
        ...sessionInForm,
        userId: user.uid,
        name: name,
        motherQuestsFks: motherQuestsFks,
        associatedProgress: associatedProgress,
        start: start,
        end: end,
      });
      await SessionRepository.save(user.uid, session);
      finishAddEdit();
    };

    return (
      <form onSubmit={handleSubmit} className="form-card">
        <input
          type="text"
          value={name}
          placeholder="Session name"
          onChange={e => setName(e.target.value)}
          required
          className="form-input"
        />
        <select
          multiple
          value={motherQuestsFks}
          onChange={e => setMotherQuestsFks(Array.from(e.target.selectedOptions).map(o => o.value))}
          required
          className="form-select"
        >
          {Object.entries(allMotherQuestsMap).map(([id, motherQuest]) => (
            <option key={id} value={id}>{motherQuest.name}</option>
          ))}
        </select>
        {mainMotherQuest && (
          <span>
            {(mainMotherQuest.progressMetricsName || "Mother quest progress metric undetermined")}
            {mainMotherQuest.progressMetricsName !== "hoursSpent"  && (<>
              {": "}
              <input
                type="number"
                value={associatedProgress}
                placeholder={`Associated progress (max: ${mainMotherQuest.progressMetricsValue})`}
                onChange={e => setAssociatedProgress(Number(e.target.value))}
                required
                className="form-input"
              />
            </>)}
          </span>
        )}

        <input
          type="datetime-local"
          value={start}
          onChange={(e) => setStart(e.target.value)}
        />

        <input
          type="datetime-local"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
        />

        <button type="submit" className="button primary">
          {sessionInForm.id ? "Save changes" : "Add"}
        </button>
        <button type="button" className="button" onClick={finishAddEdit}>Cancel</button>
      </form>
    );
  };

  const renderExpandedSessionCard = useCallback(
    (s) => {
      const mainMotherQuest = s.motherQuestsFks?.length
        ? allMotherQuestsMap[s.motherQuestsFks[0]]
        : null;
  
      return (
        <div
          className="card"
          onClick={() => setExpandedSessionId(null)}
          style={{ cursor: "pointer" }}
        >
          <div>
            <div className="card-title expanded-card-prop">{s.name}</div>
            <div className="expanded-card-prop">
              Mother Quest:{" "}
              {s.motherQuestsFks?.length > 0
                ? s.motherQuestsFks
                    .map((id) => allMotherQuestsMap[id]?.name ?? id)
                    .join(", ")
                : "No mother items"}
            </div>
            {mainMotherQuest.progressMetricsName && mainMotherQuest.progressMetricsValue && (
              <div className="expanded-card-prop">
                Reward:{" "}
                {/* useEffect could preload this, but you can also fetch inline */}
                {/* Wrap in Suspense or prefetch in manager for better UX */}                  
                {s?.associatedProgress || "?"} {mainMotherQuest.progressMetricsName} out of {mainMotherQuest.progressMetricsValue}
              </div>
            )}
            <div className="expanded-card-prop">
              Time range: {s.start && s.end && manager.formatDateRange(s.start, s.end)}
            </div>
          </div>
          {manager.renderCardButtons(s, { isFormOpen: isSessionInForm, setFormItem: setSessionInForm })}
        </div>
      );
    },
    [allMotherQuestsMap, manager]
  );

  const renderSessionCard = useCallback(
    (s) => {
      const mainMotherQuest = allMotherQuestsMap[s.motherQuestsFks[0]];
      const progressMetricsName = mainMotherQuest?.progressMetricsName;
      const progressMetricsValue = mainMotherQuest?.progressMetricsValue;
      return (
        <div
          className="card"
          onClick={() => setExpandedSessionId(s.id)}
          style={{ cursor: "pointer" }}
        >
          <span className="card-text">
            {s.name} 
            {progressMetricsName && progressMetricsValue && (
              <>
                <span className="card-splitter">✦</span>
                <span>{progressMetricsName}: {s.associatedProgress}/{progressMetricsValue}</span>
              </>
            )}
            {s.start && s.end && (
              <span className="countdown">
                <manager.SessionCountdown start={s.start} end={s.end} />
              </span>
            )}
          </span>
          {manager.renderCardButtons(s, { isFormOpen: isSessionInForm, setFormItem: setSessionInForm })}
        </div>
      );
    },
    [allMotherQuestsMap, manager]
  );

  return (
    <>
      <h2 style={{ marginBottom: "0.5rem" }}>Pending</h2>
      {pendingSessions.length === 0 && (
        <p>No pending sessions. Add your next session!</p>
      )}


      <ul>
        {pendingSessions.map((s) =>
          expandedSessionId === s.id ? (
            <li key={s.id} className="card-li">
              {renderExpandedSessionCard(s)}
            </li>
          ) : (
            <li key={s.id} className="card-li">
              {renderSessionCard(s)}
            </li>
          )
        )}
      </ul>


      {/* <ul>
        {pendingSessions.map(s => (
          <li key={s.id} className="card-li">
            {renderSessionCard(s)}
          </li>
        ))}
      </ul>*/}

      {isSessionInForm && <SessionForm />}

      <div className="row-buttons">
        {!isSessionInForm && (
          <button className="button" onClick={() => setSessionInForm(new Session())}>
            + Add Session
          </button>
        )}
        <button className="button" onClick={() => setIsShowCompletedSessions(!isShowCompletedSessions)}>
          {isShowCompletedSessions ? "Hide Completed Sessions" : "See Completed Sessions"}
        </button>
      </div>

      {isShowCompletedSessions && (
        <>
          <h2>Completed</h2>
          <ul>
            {completedSessions.map(s => (
              <li key={s.id} className="card-li">
                {renderSessionCard(s)}
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
