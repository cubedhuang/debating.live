import { createServer } from 'http';

import { handler } from '../build/handler.js';
import { createWss } from '../src/lib/wss/index';

const PORT = process.env.PORT || 3000;

const httpServer = createServer((req, res) => {
	if (req.url?.startsWith('/socket.io')) {
		return;
	}

	handler(req, res, () => {
		res.statusCode = 404;
		res.end('Not found');

		console.error(`Request ${req.url} not found`);
	});
});

createWss(httpServer);

httpServer.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}`);
});
