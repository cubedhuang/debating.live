import { Server } from 'socket.io';
import type { Plugin } from 'vite';

export const wss: Plugin = {
	name: 'wss',

	configureServer(server) {
		if (!server.httpServer) {
			throw new Error('No http server instance found.');
		}

		const io = new Server(server.httpServer);

		io.on('connection', socket => {
			console.log(`User ${socket.id} connected`);

			socket.on('disconnect', () => {
				console.log(`User ${socket.id} disconnected`);
			});

			socket.emit('message', 'Hello from server');
		});
	}
};
