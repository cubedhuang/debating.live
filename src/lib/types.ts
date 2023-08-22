export type Session = {
	id: string;
	displayName: string;
	roomId?: string;
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

export type PublicUserInfo = {
	displayName: string;
};

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
	| { timestamp: number; type: 'timerDone'; timerType: TimerType };
