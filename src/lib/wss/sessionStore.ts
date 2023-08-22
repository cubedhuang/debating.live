export type Session = {
	sessionId: string;
	userId: string;
	displayName: string;
};

export interface SessionStore<T extends Session = Session> {
	findSession: (id: string) => T | undefined;
	saveSession: (session: T) => void;
	findAllSessions: () => T[];
}

export class InMemorySessionStore<T extends Session = Session>
	implements SessionStore<T>
{
	private sessions: Map<string, T>;

	constructor() {
		this.sessions = new Map();
	}

	findSession(id: string) {
		return this.sessions.get(id);
	}

	saveSession(session: T) {
		this.sessions.set(session.sessionId, session);
	}

	findAllSessions() {
		return [...this.sessions.values()];
	}
}
