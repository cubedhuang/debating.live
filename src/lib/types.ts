export type Session = {
	sessionId: string;
	userId: string;
	displayName: string;
};

export type RoomInfo = {
	id: string;
	name: string;
	owner: string;
	users: string[];
	userData: Record<string, PublicUserInfo>;
	timers: Record<TimerType, TimerInfo>;
	actions: ActionData[];
};

export type PublicUserInfo = Omit<Session, 'sessionId'>;

export type TimerType = 'main' | 'affPrep' | 'negPrep';

export type TimerInfo = {
	type: TimerType;
	totalSeconds: number;
	secondsLeft: number;
	active: boolean;
};

export type UserAction =
	| { type: 'startTimer' | 'pauseTimer' | 'resetTimer'; timerType: TimerType }
	| { type: 'addTime'; timerType: TimerType; seconds: number };

export type ServerAction =
	| { type: 'timerDone'; timerType: TimerType }
	| { type: 'userJoin'; userId: string }
	| { type: 'userLeave'; userId: string };

export type ActionData =
	| (UserAction & { timestamp: number; userId: string })
	| (ServerAction & { timestamp: number });
