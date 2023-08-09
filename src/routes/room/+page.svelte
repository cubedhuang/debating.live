<h1>Joining Room</h1>

<form
	on:submit|preventDefault
	class="mt-12 max-w-sm mx-auto flex flex-col text-center"
>
	<input
		type="text"
		placeholder="Your name..."
		class="bg-white px-4 py-2 border-2 rounded-xl
			focus:border-gray-500 transition outline-none"
		required
		maxlength="20"
		minlength="2"
	/>

	<input
		type="text"
		placeholder="ROOM"
		class="mt-8 bg-white px-4 py-2 border-2 border-blue-200 text-blue-500 text-xl text-center rounded-xl
			focus:border-blue-500 transition outline-none"
		required
		maxlength="4"
		minlength="4"
	/>

	<button type="submit" class="mt-2 button button-blue"> Join Room </button>
</form>
