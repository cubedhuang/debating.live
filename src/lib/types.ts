import type { Session } from './wss/sessionStore';

export type ServerToClientEvents = {
	whoAreYou: () => void;
	youAre: (id: string) => void;
};

export type ClientToServerEvents = {
	iAm: (id: string) => void;
};

export type InterServerEvents = {};

export type SocketData = Session & {};
