import { Session } from "../models/Session";
import { CommonRepository } from "./CommonRepository";

// Mapper
export const SessionMapper = {
  fromDTO: (doc) => new Session({ 
    id: doc.id,
    googleEventId: doc.googleEventId,
    userId: doc.userId,
    name: doc.name,
    motherQuestsFks: doc.motherQuestsFks,
    associatedProgress: doc.associatedProgress,
    start: doc.start ? new Date(doc.start) : null,
    end: doc.end ? new Date(doc.end) : null,
    recurrence: doc.recurrence,
    status: doc.status,
    comment: doc.comment,
  }),
  toDTO: (session) => ({
    id: session.id,
    googleEventId: session.googleEventId,
    userId: session.userId,
    name: session.name,
    motherQuestsFks: session.motherQuestsFks,
    associatedProgress: session.associatedProgress,
    start: session.start ? session.start.toISOString() : null,
    end: session.end ? session.end.toISOString() : null,
    recurrence: session.recurrence,
    status: session.status,
    comment: session.comment,
  }),
};

// Repository
export const SessionRepository = new CommonRepository("sessions", SessionMapper);
