import type { RoomInfo, Session } from '$lib/types';
import { Server, Socket } from 'socket.io';

import type {
	ClientToServerEvents,
	InterServerEvents,
	ServerToClientEvents,
	SocketData
} from './types';

function createRoomId() {
	return Array.from({ length: 4 }, () =>
		String.fromCharCode(65 + Math.floor(Math.random() * 26))
	).join('');
}

export function createWss(server: import('node:http').Server) {
	const io = new Server<
		ClientToServerEvents,
		ServerToClientEvents,
		InterServerEvents,
		SocketData
	>(server);

	const sessions = new Map<string, Session>();
	const rooms = new Map<string, RoomInfo>();

	function addUserToRoom(
		socket: Socket<
			ClientToServerEvents,
			ServerToClientEvents,
			InterServerEvents,
			SocketData
		>,
		room: RoomInfo
	) {
		const session = sessions.get(socket.data.id)!;

		session.roomId = room.id;

		if (!room.users.includes(session.id)) {
			room.users.push(session.id);
			room.userData[session.id] = sessions.get(session.id)!;
		}

		socket.join(room.id);
	}

	io.use((socket, next) => {
		const sessionId = socket.handshake.auth.sessionId;

		if (sessionId) {
			const session = sessions.get(sessionId);

			if (session) {
				socket.data.id = sessionId;
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

		socket.data.id = crypto.randomUUID();
		socket.data.displayName = displayName;
		next();
	});

	io.on('connection', socket => {
		sessions.set(socket.data.id, {
			id: socket.data.id,
			displayName: socket.data.displayName
		});

		socket.emit('session', {
			id: socket.data.id,
			displayName: socket.data.displayName
		});

		socket.on('disconnect', () => {
			console.log(`User ${socket.id} disconnected`);
		});

		socket.on('createRoom', (roomName, callback) => {
			const room: RoomInfo = {
				id: createRoomId(),
				name: roomName,
				owner: socket.data.id,
				users: [],
				userData: {},
				timers: {
					main: {
						type: 'main',
						totalSeconds: 4 * 60,
						secondsLeft: 4 * 60,
						active: false
					},
					affPrep: {
						type: 'affPrep',
						totalSeconds: 3 * 60,
						secondsLeft: 3 * 60,
						active: false
					},
					negPrep: {
						type: 'negPrep',
						totalSeconds: 3 * 60,
						secondsLeft: 3 * 60,
						active: false
					}
				},
				actions: []
			};

			rooms.set(room.id, room);

			addUserToRoom(socket, room);

			callback(room);
		});

		socket.on('joinRoom', (roomId, callback) => {
			const room = rooms.get(roomId);

			if (!room) {
				callback(null);
				return;
			}

			addUserToRoom(socket, room);

			io.to(room.id).emit('roomUpdate', room);

			callback(room);
		});

		socket.on('roomAction', action => {
			const session = sessions.get(socket.data.id)!;
			if (!session.roomId) return;

			const room = rooms.get(session.roomId)!;

			switch (action.type) {
				case 'startTimer':
					room.timers[action.timerType].active = true;
					break;
				case 'pauseTimer':
					room.timers[action.timerType].active = false;
					break;
				case 'resetTimer':
					room.timers[action.timerType].secondsLeft =
						room.timers[action.timerType].totalSeconds;
					room.timers[action.timerType].active = false;
					break;
				case 'addTime':
					room.timers[action.timerType].secondsLeft += action.seconds;
					room.timers[action.timerType].secondsLeft = Math.max(
						room.timers[action.timerType].secondsLeft,
						0
					);
					break;
			}

			room.actions.push({
				...action,
				timestamp: Date.now(),
				user: socket.data.id
			});

			if (room.actions.length > 100) {
				room.actions.splice(0, room.actions.length - 100);
			}

			io.to(session.roomId).emit('roomUpdate', room);
		});
	});

	setInterval(() => {
		for (const room of rooms.values()) {
			for (const timer of Object.values(room.timers)) {
				if (timer.secondsLeft <= 0 && timer.active) {
					timer.secondsLeft = 0;
					timer.active = false;

					room.actions.push({
						timestamp: Date.now(),
						type: 'timerDone',
						timerType: timer.type
					});

					io.to(room.id).emit('roomUpdate', room);
				} else if (timer.active) {
					timer.secondsLeft -= 1;
				}
			}
		}
	}, 1000);
}
