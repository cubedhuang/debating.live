<script lang="ts">
	import { page } from '$app/stores';
	import ArrowPathMini from '$lib/components/icons/ArrowPathMini.svelte';
	import Backward from '$lib/components/icons/Backward.svelte';
	import Forward from '$lib/components/icons/Forward.svelte';
	import MinusSmallMini from '$lib/components/icons/MinusSmallMini.svelte';
	import PauseMini from '$lib/components/icons/PauseMini.svelte';
	import PlayMini from '$lib/components/icons/PlayMini.svelte';
	import PlusSmallMini from '$lib/components/icons/PlusSmallMini.svelte';
	import { currentRoom, displayName, sessionId, socket } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { formatDuration } from '$lib';
	import type { TimerType } from '$lib/types';

	enum Display {
		Connect,
		In,
		Done
	}

	let display: Display = Display.Connect;

	$: if ($socket && (!$sessionId || !$currentRoom?.id)) {
		display = Display.Connect;
	} else if ($socket && $sessionId) {
		display = Display.In;
	}

	$: if ($socket && $sessionId && !$currentRoom?.id && !$socket.connected) {
		$socket.connect().emit('joinRoom', $page.params.code, room => {
			if (!room) {
				goto('/');
				return;
			}

			$currentRoom = room;
		});
	}

	function joinRoom() {
		if (!$socket) return;

		$socket.auth = {
			...$socket.auth,
			displayName: $displayName
		};

		$socket.connect().emit('joinRoom', $page.params.code, room => {
			if (!room) {
				goto('/');
				return;
			}

			$currentRoom = room;
		});
	}

	onMount(() => {
		const id = setInterval(() => {
			for (const timerType of Object.keys($currentRoom?.timers ?? {})) {
				if (
					$currentRoom?.timers[timerType as TimerType].active &&
					$currentRoom?.timers[timerType as TimerType].secondsLeft > 0
				) {
					$currentRoom.timers[timerType as TimerType].secondsLeft--;
				}
			}
		}, 1000);

		return () => {
			clearInterval(id);
		};
	});

	const sideToTimerType = (side: string) =>
		(side.toLowerCase() + 'Prep') as TimerType;

	const timerTypeToName = (timerType: TimerType) =>
		timerType === 'main'
			? 'Speech Timer'
			: timerType === 'affPrep'
			? 'Aff Prep Time'
			: 'Neg Prep Time';

	const userIdToDisplayName = (userId: string) =>
		$currentRoom?.userData[userId]?.displayName ?? 'Unknown';

	let scrollableActivity: HTMLDivElement | null = null;

	function scrollToBottom() {
		if (scrollableActivity)
			scrollableActivity.scrollTop = scrollableActivity.scrollHeight;
	}

	$: if ($currentRoom) {
		requestAnimationFrame(() => scrollToBottom());
	}

	$: roomId = $currentRoom?.id ?? '';
</script>

{#if display === Display.Connect}
	<main class="wrapper">
		<h1>Joining Room &middot; {$page.params.code}</h1>

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

			<button
				type="submit"
				disabled={$displayName.length < 2}
				class="w-full button button-blue"
			>
				Join
			</button>

			<a href="/" class="mt-4 button button-gray">Back</a>
		</form>
	</main>
{:else if display === Display.In}
	<main
		class="md:h-screen px-8 lg:px-20 py-12 max-w-screen-2xl mx-auto flex flex-col"
	>
		<div class="flex flex-wrap justify-between h-12">
			<p>
				{$displayName}
				<!-- &middot;
				<span class="text-red-500">Neg (2nd)</span> -->
			</p>

			<p>
				{$currentRoom?.name} &middot;
				<span class="font-mono font-semibold">
					{$page.params.code}
				</span>
			</p>
		</div>

		<div class="flex-1 flex flex-col md:flex-row gap-8">
			<div class="flex-1 flex flex-col">
				<div
					class="flex-1 flex flex-col justify-center text-center bg-white border-2 rounded-xl p-8"
				>
					<!-- <h2 class="text-gray-500">2nd Rebuttal &middot; Neg</h2> -->

					<h2 class="text-gray-500">Speech Timer</h2>

					<p class="mt-2 text-5xl font-mono font-semibold">
						{formatDuration(
							$currentRoom?.timers.main.secondsLeft ?? 0
						)}
					</p>

					<div class="mt-4 flex justify-center gap-2">
						<button
							class="border-2 rounded-xl p-2 text-green-500 hover:bg-green-100 hover:border-green-500 transition
								disabled:hover:border-gray-200 disabled:text-gray-500 disabled:bg-gray-100"
							title="Start Timer"
							disabled={$currentRoom?.timers.main.secondsLeft ===
								0}
							on:click={() => {
								$socket?.emit('roomAction', roomId, {
									type: $currentRoom?.timers.main.active
										? 'pauseTimer'
										: 'startTimer',
									timerType: 'main'
								});
							}}
						>
							{#if $currentRoom?.timers.main.active}
								<PauseMini />
							{:else}
								<PlayMini />
							{/if}
						</button>

						<button
							class="border-2 rounded-xl p-2 text-green-500 hover:bg-green-100 hover:border-green-500 transition
								disabled:hover:border-gray-200 disabled:text-gray-500 disabled:bg-gray-100"
							title="Reset Timer"
							disabled={$currentRoom?.timers.main.secondsLeft ===
								$currentRoom?.timers.main.totalSeconds &&
								!$currentRoom?.timers.main.active}
							on:click={() => {
								$socket?.emit('roomAction', roomId, {
									type: 'resetTimer',
									timerType: 'main'
								});
							}}
						>
							<ArrowPathMini />
						</button>
					</div>

					<div
						class="mt-2 grid grid-cols-2 sm:flex justify-center gap-2"
					>
						<button
							class="justify-self-end w-16 flex items-center justify-center border-2 rounded-xl p-1 text-gray-500 hover:bg-gray-100 hover:border-gray-500 transition"
							on:click={() => {
								$socket?.emit('roomAction', roomId, {
									type: 'addTime',
									timerType: 'main',
									seconds: 60
								});
							}}
						>
							<PlusSmallMini />

							1m
						</button>

						<button
							class="justify-self-start w-16 flex items-center justify-center border-2 rounded-xl p-1 text-gray-500 hocus-visible:bg-gray-100 hocus-visible:border-gray-500 transition"
							on:click={() => {
								$socket?.emit('roomAction', roomId, {
									type: 'addTime',
									timerType: 'main',
									seconds: 10
								});
							}}
						>
							<PlusSmallMini />

							10s
						</button>

						<button
							class="justify-self-end w-16 flex items-center justify-center border-2 rounded-xl p-1 text-gray-500 hocus-visible:bg-gray-100 hocus-visible:border-gray-500 transition"
							on:click={() => {
								$socket?.emit('roomAction', roomId, {
									type: 'addTime',
									timerType: 'main',
									seconds: -10
								});
							}}
						>
							<MinusSmallMini />

							10s
						</button>

						<button
							class="justify-self-start w-16 flex items-center justify-center border-2 rounded-xl p-1 text-gray-500 hocus-visible:bg-gray-100 hocus-visible:border-gray-500 transition"
							on:click={() => {
								$socket?.emit('roomAction', roomId, {
									type: 'addTime',
									timerType: 'main',
									seconds: -60
								});
							}}
						>
							<MinusSmallMini />

							1m
						</button>
					</div>
				</div>

				<!-- <div
					class="mt-4 flex flex-col-reverse sm:flex-row justify-between gap-x-4 gap-y-2"
				>
					<button
						class="flex justify-center gap-2 items-center button button-gray"
					>
						<Backward />
						Neg Final Focus
					</button>

					<button
						class="flex justify-center gap-2 items-center button button-green"
					>
						Grand Crossfire
						<Forward />
					</button>
				</div> -->

				<div class="mt-8 gap-4 grid sm:grid-cols-2">
					{#each ['Aff', 'Neg'] as side}
						{@const timerType = sideToTimerType(side)}

						<div
							class="bg-white border-2 rounded-xl p-6 flex items-center"
						>
							<div>
								<h2 class="text-gray-500">
									{side} Prep Time
								</h2>

								<p
									class="mt-2 text-4xl font-mono font-semibold {side ===
									'Aff'
										? 'text-blue-500'
										: 'text-red-500'}"
								>
									{formatDuration(
										$currentRoom?.timers[timerType]
											.secondsLeft ?? 0
									)}
								</p>
							</div>

							<div class="ml-auto flex flex-col gap-0.5">
								<button
									class="border-2 rounded-xl p-2 text-green-500 hover:bg-green-100 hover:border-green-500 transition
										disabled:hover:border-gray-200 disabled:text-gray-500 disabled:bg-gray-100"
									title="Start Timer"
									disabled={$currentRoom?.timers[timerType]
										.secondsLeft === 0}
									on:click={() => {
										$socket?.emit('roomAction', roomId, {
											type: $currentRoom?.timers[
												timerType
											].active
												? 'pauseTimer'
												: 'startTimer',
											timerType
										});
									}}
								>
									{#if $currentRoom?.timers[timerType].active}
										<PauseMini />
									{:else}
										<PlayMini />
									{/if}
								</button>

								<button
									class="border-2 rounded-xl p-2 text-green-500 hover:bg-green-100 hover:border-green-500 transition
										disabled:hover:border-gray-200 disabled:text-gray-500 disabled:bg-gray-100"
									title="Reset Timer"
									disabled={$currentRoom?.timers[timerType]
										.secondsLeft ===
										$currentRoom?.timers[timerType]
											.totalSeconds &&
										!$currentRoom?.timers[timerType].active}
									on:click={() => {
										$socket?.emit('roomAction', roomId, {
											type: 'resetTimer',
											timerType
										});
									}}
								>
									<ArrowPathMini />
								</button>
							</div>

							<div class="ml-2 flex flex-col gap-0.5">
								<button
									class="border-2 rounded-xl px-2 py-0.5 flex items-center text-gray-500 hocus-visible:bg-gray-100 hocus-visible:border-gray-500 transition"
									on:click={() => {
										$socket?.emit('roomAction', roomId, {
											type: 'addTime',
											timerType,
											seconds: 60
										});
									}}
								>
									<PlusSmallMini /> 1m
								</button>

								<button
									class="border-2 rounded-xl px-2 py-0.5 flex items-center text-gray-500 hocus-visible:bg-gray-100 hocus-visible:border-gray-500 transition"
									on:click={() => {
										$socket?.emit('roomAction', roomId, {
											type: 'addTime',
											timerType,
											seconds: 10
										});
									}}
								>
									<PlusSmallMini /> 10s
								</button>

								<button
									class="border-2 rounded-xl px-2 py-0.5 flex items-center text-gray-500 hocus-visible:bg-gray-100 hocus-visible:border-gray-500 transition"
									on:click={() => {
										$socket?.emit('roomAction', roomId, {
											type: 'addTime',
											timerType,
											seconds: -10
										});
									}}
								>
									<MinusSmallMini /> 10s
								</button>

								<button
									class="border-2 rounded-xl px-2 py-0.5 flex items-center text-gray-500 hocus-visible:bg-gray-100 hocus-visible:border-gray-500 transition"
									on:click={() => {
										$socket?.emit('roomAction', roomId, {
											type: 'addTime',
											timerType,
											seconds: -60
										});
									}}
								>
									<MinusSmallMini /> 1m
								</button>
							</div>
						</div>
					{/each}
				</div>
			</div>

			<div
				class="shrink-0 md:w-56 lg:w-64 xl:w-80 grid sidebar md:max-h-[calc(100vh-9rem)] gap-8"
			>
				<div class="bg-white border-2 rounded-xl p-6 overflow-y-auto">
					<!-- <h2 class="text-gray-500">Judges &mdash; 1</h2>

					{#each { length: 1 } as _, i}
						<p class="mt-1 line-clamp-1 break-all">Joshua</p>
					{/each}

					<h2 class="mt-4 text-gray-500">Competitors &mdash; 4</h2>

					<p class="mt-1 flex justify-between gap-2">
						<span class="line-clamp-1 break-all"
							>Danielllllllllllllllllllllllllllllllllllllllllllllllll</span
						>
						<span class="text-blue-500">Aff</span>
					</p>
					<p class="mt-1 flex justify-between gap-2">
						<span class="line-clamp-1 break-all">Owen</span>
						<span class="text-blue-500">Aff</span>
					</p>
					<p class="mt-1 flex justify-between gap-2">
						<span class="line-clamp-1 break-all">Pranaya</span>
						<span class="text-red-500">Neg</span>
					</p>
					<p class="mt-1 flex justify-between gap-2">
						<span class="line-clamp-1 break-all">Anna</span>
						<span class="text-red-500">Neg</span>
					</p>
					
					<h2 class="mt-4 text-gray-500">Spectators &mdash; 5</h2>
					
					{#each { length: 5 } as _, i}
					<p class="mt-1 line-clamp-1 break-all">
						Spectator {i}
					</p>
					{/each} -->

					<h2 class="text-gray-500">
						People &mdash; {$currentRoom?.users.length ?? 0}
					</h2>

					{#each Object.values($currentRoom?.userData ?? {}) as user}
						<p class="mt-1 flex justify-between gap-2">
							<span class="line-clamp-1 break-all"
								>{user.displayName}</span
							>
							<!-- <span class="text-blue-500">Aff</span> -->
						</p>
					{/each}
				</div>

				<div class="flex flex-col bg-white border-2 rounded-xl">
					<h2 class="p-6 pb-2 text-gray-500 border-b-2">Activity</h2>

					<div
						class="mt-auto overflow-y-auto h-48 md:h-auto p-6 flex flex-col gap-2 text-xs"
						bind:this={scrollableActivity}
					>
						{#each $currentRoom?.actions ?? [] as action}
							<p>
								<span
									class="text-gray-500 font-mono font-semibold tracking-tighter inline-block mr-1"
								>
									{new Date(
										action.timestamp
									).toLocaleTimeString()}
								</span>

								{#if action.type === 'timerDone'}
									{timerTypeToName(action.timerType)} done
								{:else if action.type === 'startTimer' || action.type === 'resetTimer' || action.type === 'pauseTimer'}
									<span class="font-semibold">
										{userIdToDisplayName(action.user)}
									</span>
									{#if action.type === 'startTimer'}
										started
									{:else if action.type === 'resetTimer'}
										reset
									{:else if action.type === 'pauseTimer'}
										paused
									{/if}
									{timerTypeToName(action.timerType)}
								{:else if action.type === 'addTime'}
									<span class="font-semibold">
										{userIdToDisplayName(action.user)}
									</span>
									{#if action.seconds > 0}
										added {action.seconds} seconds to
									{:else if action.seconds < 0}
										removed {-action.seconds} seconds from
									{/if}

									{timerTypeToName(action.timerType)}
								{:else if action.type === 'userJoin'}
									<span class="font-semibold">
										{userIdToDisplayName(action.user)}
									</span>

									joined
								{/if}
							</p>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</main>
{/if}

<style lang="postcss">
	.sidebar {
		grid-template-rows: 16rem minmax(0, 1fr);
	}
</style>
