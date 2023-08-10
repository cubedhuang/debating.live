import type { Plugin } from 'vite';
import { WebSocketServer } from 'ws';

declare global {
	var __server: WebSocketServer | undefined;
}

export const wss: Plugin = {
	name: 'wss',

	configureServer(server) {
		const wss = new WebSocketServer({
			port: 443
		});

		wss.on('connection', ws => {
			console.log('connected');

			ws.on('message', message => {
				console.log('received: %s', message);
			});

			ws.on('close', () => {
				console.log('disconnected');
			});

			ws.send('hello');
		});

		wss.on('close', () => {
			console.log('closed');
		});

		if (import.meta.env.DEV) {
			if (globalThis.__server) {
				globalThis.__server.close();
			}

			const server = new WebSocketServer({ port: 8080 });
			globalThis.__server = server;
		}
	}
};
