import {
	type RoomInfo,
	type Session,
	UserRole,
	UserPermissions
} from '../types';
import { Server, Socket } from 'socket.io';

import type {
	ClientToServerEvents,
	InterServerEvents,
	ServerToClientEvents,
	SocketData
} from './types';

process.on('unhandledRejection', error => {
	console.error('unhandledRejection', error);
});

process.on('uncaughtException', error => {
	console.error('uncaughtException', error);
});

function badDisplayName(displayName: unknown): displayName is string {
	return (
		!displayName ||
		typeof displayName !== 'string' ||
		displayName.length < 2 ||
		displayName.length > 32
	);
}

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

	const sessionConnectionCounts = new Map<string, number>();
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
		const session = sessions.get(socket.data.sessionId)!;

		if (!room.users.includes(session.userId)) {
			room.users.push(session.userId);
		}

		if (!room.userData[session.userId]) {
			room.userData[session.userId] = {
				userId: session.userId,
				displayName: session.displayName,
				role:
					room.ownerId === session.userId
						? UserRole.Competitor
						: UserRole.Spectator,
				permissions:
					room.ownerId === session.userId
						? UserPermissions.Owner
						: UserPermissions.Default
			};
		} else {
			// update display name
			room.userData[session.userId].displayName = session.displayName;
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

				const displayName = socket.handshake.auth.displayName;
				if (badDisplayName(displayName)) {
					socket.data.displayName = session.displayName;
				} else {
					socket.data.displayName = displayName;
				}
				return next();
			}
		}

		const displayName = socket.handshake.auth.displayName;

		if (badDisplayName(displayName)) {
			return next(new Error('Invalid Display Name'));
		}

		socket.data.sessionId = crypto.randomUUID();
		socket.data.userId = crypto.randomUUID();
		socket.data.displayName = displayName;
		next();
	});

	io.on('connection', socket => {
		sessionConnectionCounts.set(
			socket.data.sessionId,
			(sessionConnectionCounts.get(socket.data.sessionId) ?? 0) + 1
		);

		sessions.set(socket.data.sessionId, {
			sessionId: socket.data.sessionId,
			userId: socket.data.userId,
			displayName: socket.data.displayName
		});

		socket.emit('session', sessions.get(socket.data.sessionId)!);

		socket.on('disconnect', () => {
			sessionConnectionCounts.set(
				socket.data.sessionId,
				(sessionConnectionCounts.get(socket.data.sessionId) ?? 0) - 1
			);

			if (sessionConnectionCounts.get(socket.data.sessionId) === 0) {
				for (const room of rooms.values()) {
					if (room.users.includes(socket.data.userId)) {
						room.users = room.users.filter(
							userId => userId !== socket.data.userId
						);
						// don't delete user data in case they rejoin

						const actionData = {
							timestamp: Date.now(),
							type: 'userLeave' as const,
							userId: socket.data.userId
						};
						room.actions.push(actionData);

						io.to(room.id).emit('roomUpdate', room, actionData);
					}
				}
			}
		});

		socket.on('createRoom', (roomName, callback) => {
			if (roomName.length < 2) {
				return;
			} else if (roomName.length > 64) {
				roomName = roomName.slice(0, 64);
			}

			const room: RoomInfo = {
				id: createRoomId(),
				name: roomName,
				ownerId: socket.data.userId,
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

			const actionData = {
				timestamp: Date.now(),
				type: 'userJoin' as const,
				userId: socket.data.userId
			};
			room.actions.push(actionData);

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

			socket.broadcast.to(room.id).emit('roomUpdate', room, actionData);

			callback(room);
		});

		socket.on('roomAction', (roomId, action) => {
			const session = sessions.get(socket.data.sessionId)!;
			const room = rooms.get(roomId);
			if (!room || !room.users.includes(session.userId)) return;

			const user = room.userData[session.userId];

			if (
				user.permissions !== UserPermissions.Owner &&
				user.permissions !== UserPermissions.Admin &&
				user.role === UserRole.Spectator
			) {
				return;
			}

			let makeNewAction = true;

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
				case 'addTime': {
					room.timers[action.timerType].secondsLeft += action.seconds;
					room.timers[action.timerType].secondsLeft = Math.max(
						room.timers[action.timerType].secondsLeft,
						0
					);
					const lastAction = room.actions[room.actions.length - 1];
					if (
						lastAction?.type === 'addTime' &&
						lastAction.timerType === action.timerType &&
						lastAction.userId === session.userId &&
						lastAction.timestamp > Date.now() - 3000 &&
						Math.sign(lastAction.seconds) ===
							Math.sign(action.seconds)
					) {
						lastAction.seconds += action.seconds;
						makeNewAction = false;
					}
					break;
				}
				case 'setRole':
					if (
						user.permissions === UserPermissions.Owner ||
						user.permissions === UserPermissions.Admin
					) {
						room.userData[action.toUserId].role = action.role;
					} else {
						return;
					}
					break;
				case 'setPermissions':
					if (user.permissions === UserPermissions.Owner) {
						room.userData[action.toUserId].permissions =
							action.permissions;

						if (action.permissions === UserPermissions.Owner) {
							room.userData[session.userId].permissions =
								UserPermissions.Admin;
							room.ownerId = action.toUserId;
						}
					} else {
						return;
					}
					break;
				default:
					// @ts-expect-error switch should be exhaustive
					return action.type;
			}

			if (makeNewAction) {
				const actionData = {
					...action,
					timestamp: Date.now(),
					userId: session.userId
				};
				room.actions.push(actionData);
			}

			if (room.actions.length > 100) {
				room.actions.splice(0, room.actions.length - 100);
			}

			io.to(roomId).emit(
				'roomUpdate',
				room,
				room.actions[room.actions.length - 1]
			);
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
