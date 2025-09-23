import { SessionRepository } from "../repositories/SessionRepository";
import { Session } from "../models/Session";
import { useState, useCallback } from "react";
import useSessionTabManager from "../hooks/useSessionTabManager";
import useGoogleCalendarManager from "../hooks/useGoogleCalendarManager.jsx";


export default function SessionsTab({user}) {

  const numberEventsToFetch = 5;

  const [sessionInForm, setSessionInForm] = useState(null);
  const [expandedSessionId, setExpandedSessionId] = useState(null);
  const [isShowCompletedSessions, setIsShowCompletedSessions] = useState(false);

  const manager = useSessionTabManager();
  const googleCalendarManager = useGoogleCalendarManager();
  
  const SessionForm = () => {
    const [name, setName] = useState(sessionInForm?.name || "");
    const [motherQuestsFks, setMotherQuestsFks] = useState(sessionInForm?.motherQuestsFks || []);
    const mainMotherQuest = manager.allMotherQuestsMap[motherQuestsFks[0]];
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
          {Object.entries(manager.allMotherQuestsMap).map(([id, motherQuest]) => (
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

  const renderSessionCard = (s, expanded = false) => {
    const mainMotherQuest = s.motherQuestsFks?.length
      ? manager.allMotherQuestsMap[s.motherQuestsFks[0]]
      : null;
  
    return (
      <div
        className="card"
        onClick={() =>
          setExpandedSessionId(expanded ? null : s.id)
        }
        style={{ cursor: "pointer" }}
      >
        {expanded ? (
          <div>
            <div className="card-title expanded-card-prop">{s.name}</div>
            <div className="expanded-card-prop">
              Mother Quest:{" "}
              {s.motherQuestsFks?.length
                ? s.motherQuestsFks
                    .map((id) => manager.allMotherQuestsMap[id]?.name ?? id)
                    .join(", ")
                : "No mother items"}
            </div>
            {mainMotherQuest?.progressMetricsName &&
              mainMotherQuest?.progressMetricsValue && (
                <div className="expanded-card-prop">
                  Reward: {s.associatedProgress || "?"}{" "}
                  {mainMotherQuest.progressMetricsName} out of{" "}
                  {mainMotherQuest.progressMetricsValue}
                </div>
              )}
            <div className="expanded-card-prop">
              Time range:{" "}
              {s.start && s.end && manager.formatDateRange(s.start, s.end)}
            </div>
          </div>
        ) : (
          <div className="card-text">
            {s.name}
            {mainMotherQuest?.progressMetricsName &&
              mainMotherQuest?.progressMetricsValue && (
                <>
                  <span className="card-splitter">✦</span>
                  <span>
                    {mainMotherQuest.progressMetricsName}:{" "}
                    {s.associatedProgress}/{mainMotherQuest.progressMetricsValue}
                  </span>
                </>
              )}
            {s.start && s.end && (
              <span className="countdown">
                <manager.SessionCountdown start={s.start} end={s.end} />
              </span>
            )}
          </div>
        )}
        {manager.renderCardButtons(s, {
          isFormOpen: !!sessionInForm,
          setFormItem: setSessionInForm,
        })}
      </div>
    );
  };
  

  const renderList = (sessions) => (
    <ul>
      {sessions.map((s) => (
        <li key={s.id} className="card-li">
          {renderSessionCard(s, expandedSessionId === s.id)}
        </li>
      ))}
    </ul>
  );


  
  return (
    <>
      <h2 style={{ marginBottom: "0.5rem" }}>Pending</h2>
      {manager.pendingSessions.length === 0 && (
        <p>No pending sessions. Add your next session!</p>
      )}
      {renderList(manager.pendingSessions)}

      {sessionInForm && (
        <SessionForm
          sessionInForm={sessionInForm}
          setSessionInForm={setSessionInForm}
          user={user}
          manager={manager}
        />
      )}

      <div className="row-buttons">
        {!sessionInForm && (
          <button
            className="button"
            onClick={() => setSessionInForm(new Session())}
          >
            + Add Session
          </button>
        )}
        <button
          className="button"
          onClick={() => setIsShowCompletedSessions(!isShowCompletedSessions)}
        >
          {isShowCompletedSessions ? "Hide Completed Sessions" : "See Completed Sessions"}
        </button>
      </div>

      {isShowCompletedSessions && (
        <>
          <h2>Completed</h2>
          {renderList(manager.completedSessions)}
        </>
      )}

      <h2>Google Calendar</h2>
      {/* <iframe 
        src={`https://calendar.google.com/calendar/embed?src=${user.email}&ctz=Europe%2FBrussels&mode=WEEK&showPrint=0`} 
        style={{ border: 0, width: "100%", height: "80vh" }}
      ></iframe> */}
      <div>
        <button onClick={() => googleCalendarManager.fetchNextEvents(numberEventsToFetch)}>
          Fetch next {numberEventsToFetch} events from Google Calendar
        </button>
        {renderList(googleCalendarManager.googleEvents)}
      </div>
    </>
  );
}
