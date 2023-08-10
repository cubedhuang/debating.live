<script lang="ts">
	import { onMount } from 'svelte';

	onMount(() => {
		const ws = new WebSocket('ws://localhost:443');

		ws.addEventListener('open', () => {
			console.log('connected');
			ws.send('hello');
		});

		ws.addEventListener('message', event => {
			console.log('Message from server ', event.data);
		});

		ws.addEventListener('close', () => {
			console.log('disconnected');
		});

		ws.addEventListener('error', err => {
			console.log('error', err);
		});

		return () => {
			ws.close();
		};
	});
</script>

<h1>debating.live</h1>

<div class="mt-12 max-w-sm mx-auto flex flex-col gap-2">
	<a href="/create" class="button button-green"> Create Room </a>

	<a href="/room" class="button button-blue"> Join Room </a>

	<button class="button button-purple"> Settings </button>

	<a href="/about" class="button button-gray"> About </a>
</div>
