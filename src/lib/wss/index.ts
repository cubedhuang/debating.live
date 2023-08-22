import type { PublicUserInfo, RoomInfo, Session } from '$lib/types';
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

	function publicUserInfo(session: Session): PublicUserInfo {
		return Object.fromEntries(
			Object.entries(session).filter(([key]) => key !== 'sessionId')
		) as PublicUserInfo;
	}

	function addUserToRoom(
		socket: Socket<
			ClientToServerEvents,
			ServerToClientEvents,
			InterServerEvents,
			SocketData
		>,
		room: RoomInfo
	) {
		const session = sessions.get(socket.data.sessionId)!;

		if (!room.users.includes(session.userId)) {
			room.users.push(session.userId);
			room.userData[session.userId] = publicUserInfo(
				sessions.get(session.sessionId)!
			);
		}

		socket.join(room.id);
	}

	io.use((socket, next) => {
		const sessionId = socket.handshake.auth.sessionId;

		if (sessionId) {
			const session = sessions.get(sessionId);

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
		sessions.set(socket.data.sessionId, {
			sessionId: socket.data.sessionId,
			userId: socket.data.userId,
			displayName: socket.data.displayName
		});

		socket.emit('session', sessions.get(socket.data.sessionId)!);

		socket.on('disconnect', () => {
			console.log(`User ${socket.id} disconnected`);
		});

		socket.on('createRoom', (roomName, callback) => {
			const room: RoomInfo = {
				id: createRoomId(),
				name: roomName,
				owner: socket.data.userId,
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

			const actionData = {
				timestamp: Date.now(),
				type: 'userJoin' as const,
				userId: socket.data.userId
			};
			room.actions.push(actionData);

			io.to(room.id).emit('roomUpdate', room, actionData);

			callback(room);
		});

		socket.on('leaveRoom', roomId => {
			const room = rooms.get(roomId);

			if (!room) return;

			const session = sessions.get(socket.data.sessionId)!;

			room.users = room.users.filter(user => user !== session.userId);
			// don't delete user data, just in case they rejoin

			const actionData = {
				timestamp: Date.now(),
				type: 'userLeave' as const,
				userId: session.userId
			};
			room.actions.push(actionData);

			io.to(room.id).emit('roomUpdate', room, actionData);

			socket.leave(room.id);
		});

		socket.on('roomAction', (roomId, action) => {
			const session = sessions.get(socket.data.sessionId)!;
			const room = rooms.get(roomId);
			if (!room || !room.users.includes(session.userId)) return;

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

			const actionData = {
				...action,
				timestamp: Date.now(),
				user: session.userId
			};
			room.actions.push(actionData);

			if (room.actions.length > 100) {
				room.actions.splice(0, room.actions.length - 100);
			}

			io.to(roomId).emit('roomUpdate', room, actionData);
		});
	});

	setInterval(() => {
		for (const room of rooms.values()) {
			for (const timer of Object.values(room.timers)) {
				if (timer.secondsLeft <= 0 && timer.active) {
					timer.secondsLeft = 0;
					timer.active = false;

					const actionData = {
						timestamp: Date.now(),
						type: 'timerDone' as const,
						timerType: timer.type
					};
					room.actions.push(actionData);

					io.to(room.id).emit('roomUpdate', room, actionData);
				} else if (timer.active) {
					timer.secondsLeft -= 1;
				}
			}
		}
	}, 1000);
}
