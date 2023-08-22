<script lang="ts">
	import { goto } from '$app/navigation';
	import { currentRoom, displayName, socket } from '$lib/stores';

	let roomName = '';

	async function createRoom() {
		if (!$socket) return;

		$socket.auth = { ...$socket.auth, displayName: $displayName };
		$socket.connect().emit('createRoom', roomName, room => {
			$currentRoom = room;
			goto(`/room/${room.id}`);
		});
	}
</script>

<main class="wrapper">
	<h1>Create Room</h1>

	<form on:submit|preventDefault={createRoom} class="inputs">
		<input
			type="text"
			bind:value={$displayName}
			placeholder="Your name..."
			class="bg-white px-4 py-2 border-2 rounded-xl
				focus:border-gray-500 transition outline-none"
			required
			maxlength="64"
			minlength="2"
		/>

		<input
			type="text"
			bind:value={roomName}
			placeholder="Room name..."
			class="bg-white px-4 py-2 border-2 rounded-xl
				focus:border-gray-500 transition outline-none"
			required
			maxlength="64"
			minlength="2"
		/>

		<button
			type="submit"
			disabled={roomName.length < 2 || $displayName.length < 2}
			class="w-full button button-blue"
		>
			Create
		</button>

		<a href="/" class="mt-4 button button-gray">Back</a>
	</form>
</main>
