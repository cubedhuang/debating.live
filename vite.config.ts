import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

import { createWss } from './src/lib/wss';

export default defineConfig({
	plugins: [
		sveltekit(),
		{
			name: 'wss',
			configureServer(server) {
				if (!server.httpServer) {
					throw new Error('No http server instance found.');
				}

				createWss(server.httpServer);
			},
			configurePreviewServer(server) {
				if (!server.httpServer) {
					throw new Error('No http server instance found.');
				}

				createWss(server.httpServer);
			}
		}
	]
});
