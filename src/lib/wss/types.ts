import type { Action, ActionData, RoomInfo, Session } from '$lib/types';

export type ServerToClientEvents = {
	session: (session: Session) => void;
	roomUpdate: (room: RoomInfo, action: ActionData) => void;
};

export type ClientToServerEvents = {
	createRoom: (roomName: string, callback: (room: RoomInfo) => void) => void;
	joinRoom: (
		roomId: string,
		callback: (room: RoomInfo | null) => void
	) => void;
	leaveRoom: (roomId: string) => void;
	roomAction: (roomId: string, action: Action) => void;
};

export type InterServerEvents = {};

export type SocketData = Session & {};
