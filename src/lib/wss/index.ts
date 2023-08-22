import { Server } from 'socket.io';

import type {
	ClientToServerEvents,
	InterServerEvents,
	ServerToClientEvents,
	SocketData
} from '../types';
import { InMemorySessionStore } from './sessionStore';

export function createWss(server: import('node:http').Server) {
	const io = new Server<
		ClientToServerEvents,
		ServerToClientEvents,
		InterServerEvents,
		SocketData
	>(server);

	const sessionStore = new InMemorySessionStore();

	const rooms = new Map<string, string[]>();

	io.use((socket, next) => {
		const sessionId = socket.handshake.auth.sessionId;

		if (sessionId) {
			const session = sessionStore.findSession(sessionId);

			if (session) {
				socket.data.sessionId = sessionId;
				socket.data.userId = session.userId;
				socket.data.displayName = session.displayName;
				return next();
			}
		}

		const displayName = socket.handshake.auth.displayName;

		if (
			!displayName ||
			typeof displayName !== 'string' ||
			displayName.length < 2 ||
			displayName.length > 64
		) {
			return next(new Error('Invalid Display Name'));
		}

		socket.data.sessionId = crypto.randomUUID();
		socket.data.userId = crypto.randomUUID();
		socket.data.displayName = displayName;
		next();
	});

	io.on('connection', socket => {
		sessionStore.saveSession({
			sessionId: socket.data.sessionId,
			userId: socket.data.userId,
			displayName: socket.data.displayName
		});

		socket.on('disconnect', () => {
			console.log(`User ${socket.id} disconnected`);
		});
	});
}
