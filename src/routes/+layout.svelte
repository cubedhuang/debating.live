<script>
	import { io } from 'socket.io-client';
	import { onMount } from 'svelte';
	import '../app.postcss';
	import { socket } from '$lib/stores';

	onMount(() => {
		$socket = io({
			transports: ['websocket']
		});

		$socket.on('connect', () => {
			console.debug('connected to websocket');
		});

		$socket.on('disconnect', () => {
			console.debug('disconnected from websocket');
		});

		$socket.on('message', data => {
			console.debug(data);
		});
	});
</script>

<svelte:head>
	<title>debating.live</title>

	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" />
	<link
		href="https://fonts.googleapis.com/css2?family=Lexend:wght@100;200;300;400;500;600;700;800;900&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="min-h-screen grid place-items-center py-20 px-8">
	<main class="w-full max-w-screen-lg">
		<slot />
	</main>
</div>
