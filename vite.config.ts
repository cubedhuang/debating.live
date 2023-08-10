import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

import { wss } from './src/lib/server';

export default defineConfig({
	plugins: [sveltekit(), wss]
});
