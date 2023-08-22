<script lang="ts">
	import { goto } from '$app/navigation';
	import { socket, displayName, currentRoom } from '$lib/stores';

	let roomCode = '';

	async function joinRoom() {
		if (!$socket) return;

		$socket.auth = { ...$socket.auth, displayName: $displayName };
		$socket.connect().emit('joinRoom', roomCode, room => {
			console.log(room);

			if (!room) {
				goto('/');
				return;
			}

			$currentRoom = room;
			goto(`/room/${room.id}`);
		});
	}
</script>

<main class="wrapper">
	<h1>Joining Room</h1>

	<form on:submit|preventDefault={joinRoom} class="inputs">
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

		<div class="flex gap-2">
			<input
				type="text"
				placeholder="Room Code"
				bind:value={roomCode}
				class="flex-1 bg-white px-4 py-2 border-2 text-blue-500 text-center rounded-xl font-mono font-semibold
					focus:border-blue-500 transition outline-none"
				required
				maxlength="4"
				minlength="4"
				on:input={() => {
					roomCode = roomCode.toUpperCase().replace(/[^A-Z]/g, '');
				}}
			/>

			<button
				type="submit"
				disabled={roomCode.length !== 4 || $displayName.length < 2}
				class="shrink-0 button button-blue"
			>
				Join
			</button>
		</div>

		<a href="/" class="mt-4 button button-gray">Back</a>
	</form>
</main>
