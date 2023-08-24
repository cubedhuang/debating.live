import type { ActionData, RoomInfo, Session, UserAction } from '$lib/types';

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
	roomAction: (roomId: string, action: UserAction) => void;
};

export type InterServerEvents = Record<string, never>;

export type SocketData = Session & Record<string, never>;
