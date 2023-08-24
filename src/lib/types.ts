export type Session = {
	sessionId: string;
	userId: string;
	displayName: string;
};

export type RoomInfo = {
	id: string;
	name: string;
	ownerId: string;
	users: string[];
	userData: Record<string, PublicUserInfo>;
	timers: Record<TimerType, TimerInfo>;
	actions: ActionData[];
};

export type PublicUserInfo = {
	userId: string;
	displayName: string;
	role: UserRole;
	permissions: UserPermissions;
};

export enum UserRole {
	Judge,
	Competitor,
	Spectator
}

export enum UserPermissions {
	Default,
	Admin,
	Owner
}

export type TimerType = 'main' | 'affPrep' | 'negPrep';

export type TimerInfo = {
	type: TimerType;
	totalSeconds: number;
	secondsLeft: number;
	active: boolean;
};

export type UserAction =
	| { type: 'startTimer' | 'pauseTimer' | 'resetTimer'; timerType: TimerType }
	| { type: 'addTime'; timerType: TimerType; seconds: number }
	| { type: 'setRole'; toUserId: string; role: UserRole }
	| {
			type: 'setPermissions';
			toUserId: string;
			permissions: UserPermissions;
	  };

export type ServerAction =
	| { type: 'timerDone'; timerType: TimerType }
	| { type: 'userJoin'; userId: string }
	| { type: 'userLeave'; userId: string };

export type ActionData =
	| (UserAction & { timestamp: number; userId: string })
	| (ServerAction & { timestamp: number });
