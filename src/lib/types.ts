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

export type Action =
	| { type: 'startTimer' | 'pauseTimer' | 'resetTimer'; timerType: TimerType }
	| { type: 'addTime'; timerType: TimerType; seconds: number };

export type ActionData =
	| (Action & { timestamp: number; user: string })
	| { timestamp: number; type: 'timerDone'; timerType: TimerType }
	| { timestamp: number; type: 'userJoin'; user: string };
