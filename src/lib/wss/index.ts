import { Server } from 'socket.io';

export function createWss(server: import('node:http').Server) {
	const io = new Server(server);

	io.on('connection', socket => {
		console.log(`User ${socket.id} connected`);

		socket.on('disconnect', () => {
			console.log(`User ${socket.id} disconnected`);
		});

		socket.emit('message', 'Hello from server');
	});
}
