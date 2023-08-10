import type { Plugin } from 'vite';
import { WebSocketServer } from 'ws';

export const wss: Plugin = {
	name: 'wss',

	configureServer(server) {
		const wss = new WebSocketServer({});
	}
};
