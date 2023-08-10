<script lang="ts">
	let name = '';
	let roomCode = '';
</script>

<h1>Joining Room</h1>

<form
	on:submit|preventDefault
	class="mt-12 max-w-sm mx-auto flex flex-col gap-2"
>
	<input
		type="text"
		bind:value={name}
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
			class="flex-1 bg-white px-4 py-2 border-2 text-blue-500 text-center rounded-xl
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
			disabled={roomCode.length !== 4 || name.length < 2}
			class="shrink-0 button button-blue"
		>
			Join
		</button>
	</div>
</form>
