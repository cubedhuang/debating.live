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
</svelte:head>

<div class="min-h-screen grid place-items-center py-20 px-8">
	<main class="w-full max-w-screen-lg">
		<slot />
	</main>
</div>
