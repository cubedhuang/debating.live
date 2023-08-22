<script lang="ts">
	import { io } from 'socket.io-client';
	import { onMount } from 'svelte';
	import '../app.postcss';
	import { currentRoom, displayName, sessionId, socket } from '$lib/stores';

	onMount(() => {
		$socket = io({
			transports: ['websocket'],
			autoConnect: false
		});

		if ($sessionId) {
			$socket.auth = { sessionId: $sessionId };
			$socket.connect();
		}

		$socket.on('connect', () => {
			console.debug('connected to websocket');
		});

		$socket.on('connect_error', err => {
			console.error('failed to connect to websocket', err);
		});

		$socket.on('disconnect', () => {
			console.debug('disconnected from websocket');
		});

		$socket.on('session', session => {
			if (!$socket) return;

			$socket.auth = { ...$socket.auth, sessionId: session.sessionId };
			$sessionId = session.sessionId;
			$displayName = session.displayName;
		});

		$socket?.on('roomUpdate', room => {
			$currentRoom = room;
		});

		$socket.onAny((...args) => {
			console.debug('socket event:', ...args);
		});

		$socket.onAnyOutgoing((...args) => {
			console.debug('socket event outgoing:', ...args);
		});
	});
</script>

<svelte:window
	on:beforeunload={() => {
		if ($currentRoom?.id) $socket?.emit('leaveRoom', $currentRoom.id);
		$socket?.disconnect();
	}}
/>

<svelte:head>
	<title>debating.live</title>

	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" />
	<link
		href="https://fonts.googleapis.com/css2?family=Lexend:wght@100;200;300;400;500;600;700;800;900&family=Red+Hat+Mono:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<slot />
