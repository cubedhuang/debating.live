<script lang="ts">
	import { onMount } from 'svelte';
	import { beforeNavigate, goto } from '$app/navigation';
	import { page } from '$app/stores';

	import {
		currentRoom,
		displayName,
		sessionId,
		socket,
		userId
	} from '$lib/stores';
	import { UserRole, type TimerType, UserPermissions } from '$lib/types';
	import { formatDuration, userRoleToName } from '$lib/util';

	import ArrowPathMini from '$lib/components/icons/ArrowPathMini.svelte';
	import MinusSmallMini from '$lib/components/icons/MinusSmallMini.svelte';
	import PauseMini from '$lib/components/icons/PauseMini.svelte';
	import PlayMini from '$lib/components/icons/PlayMini.svelte';
	import PlusSmallMini from '$lib/components/icons/PlusSmallMini.svelte';
	import Activity from './Activity.svelte';
	import UserList from './UserList.svelte';

	enum Display {
		Connect,
		In
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
				joinError = "This room doesn't exist!";
				return;
			}

			$currentRoom = room;
		});
	}

	let joinError = '';

	function joinRoom() {
		if (!$socket) return;

		$socket.auth = {
			...$socket.auth,
			displayName: $displayName
		};

		$socket.connect().emit('joinRoom', $page.params.code, room => {
			if (!room) {
				joinError = "This room doesn't exist!";
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

		if ($socket && !$socket.connected) {
			$socket.connect().emit('joinRoom', $page.params.code, room => {
				if (!room) {
					joinError = "This room doesn't exist!";
					return;
				}

				$currentRoom = room;
			});
		}

		return () => {
			clearInterval(id);
		};
	});

	beforeNavigate(() => {
		$socket?.disconnect();
	});

	const sideToTimerType = (side: string) =>
		(side.toLowerCase() + 'Prep') as TimerType;

	$: roomId = $currentRoom?.id ?? '';

	$: currentUser = $currentRoom?.userData[$userId];
	$: isOwner = currentUser?.permissions === UserPermissions.Owner;
	$: isAdmin =
		isOwner ||
		$currentRoom?.userData[$userId].permissions === UserPermissions.Admin;
	$: canChangeTime =
		isAdmin || $currentRoom?.userData[$userId].role !== UserRole.Spectator;
</script>

{#if display === Display.Connect}
	<main class="wrapper">
		<h1>Joining Room &middot; {$page.params.code}</h1>

		<form on:submit|preventDefault={joinRoom} class="inputs relative">
			{#if joinError}
				<p
					class="mb-2 absolute bottom-full text-red-500 inset-x-0 text-center"
				>
					{joinError}
				</p>
			{/if}

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
				disabled={$displayName.length < 2 || joinError}
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
				&middot;
				{userRoleToName($currentRoom?.userData[$userId].role)}
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

					{#if canChangeTime}
						<div class="mt-4 flex justify-center gap-2">
							<button
								class="timer-control"
								title="Start Timer"
								disabled={$currentRoom?.timers.main
									.secondsLeft === 0}
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
								class="timer-control"
								title="Reset Timer"
								disabled={$currentRoom?.timers.main
									.secondsLeft ===
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
								class="justify-self-end main-timer-control"
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
								class="justify-self-start main-timer-control"
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
								class="justify-self-end main-timer-control"
								disabled={$currentRoom?.timers.main
									.secondsLeft === 0}
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
								class="justify-self-start main-timer-control"
								disabled={$currentRoom?.timers.main
									.secondsLeft === 0}
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
					{/if}
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

				<div
					class="mt-8 gap-4 grid {canChangeTime
						? 'lg:grid-cols-2'
						: 'sm:grid-cols-2'}"
				>
					{#each ['Aff', 'Neg'] as side}
						{@const timerType = sideToTimerType(side)}

						<div
							class="bg-white border-2 rounded-xl p-6 flex items-center"
						>
							<div
								class={canChangeTime
									? ''
									: 'w-full text-center'}
							>
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

							{#if canChangeTime}
								<div class="ml-auto flex flex-col gap-0.5">
									<button
										class="timer-control"
										title="Start Timer"
										disabled={$currentRoom?.timers[
											timerType
										].secondsLeft === 0}
										on:click={() => {
											$socket?.emit(
												'roomAction',
												roomId,
												{
													type: $currentRoom?.timers[
														timerType
													].active
														? 'pauseTimer'
														: 'startTimer',
													timerType
												}
											);
										}}
									>
										{#if $currentRoom?.timers[timerType].active}
											<PauseMini />
										{:else}
											<PlayMini />
										{/if}
									</button>

									<button
										class="timer-control"
										title="Reset Timer"
										disabled={$currentRoom?.timers[
											timerType
										].secondsLeft ===
											$currentRoom?.timers[timerType]
												.totalSeconds &&
											!$currentRoom?.timers[timerType]
												.active}
										on:click={() => {
											$socket?.emit(
												'roomAction',
												roomId,
												{
													type: 'resetTimer',
													timerType
												}
											);
										}}
									>
										<ArrowPathMini />
									</button>
								</div>

								<div class="ml-2 flex flex-col gap-0.5">
									<button
										class="prep-timer-control"
										on:click={() => {
											$socket?.emit(
												'roomAction',
												roomId,
												{
													type: 'addTime',
													timerType,
													seconds: 60
												}
											);
										}}
									>
										<PlusSmallMini /> 1m
									</button>

									<button
										class="prep-timer-control"
										on:click={() => {
											$socket?.emit(
												'roomAction',
												roomId,
												{
													type: 'addTime',
													timerType,
													seconds: 10
												}
											);
										}}
									>
										<PlusSmallMini /> 10s
									</button>

									<button
										class="prep-timer-control"
										disabled={$currentRoom?.timers[
											timerType
										].secondsLeft === 0}
										on:click={() => {
											$socket?.emit(
												'roomAction',
												roomId,
												{
													type: 'addTime',
													timerType,
													seconds: -10
												}
											);
										}}
									>
										<MinusSmallMini /> 10s
									</button>

									<button
										class="prep-timer-control"
										disabled={$currentRoom?.timers[
											timerType
										].secondsLeft === 0}
										on:click={() => {
											$socket?.emit(
												'roomAction',
												roomId,
												{
													type: 'addTime',
													timerType,
													seconds: -60
												}
											);
										}}
									>
										<MinusSmallMini /> 1m
									</button>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>

			<div
				class="shrink-0 md:w-56 lg:w-64 xl:w-80 grid sidebar md:max-h-[calc(100vh-9rem)] gap-8"
			>
				<div
					class="bg-white border-2 rounded-xl p-6 pt-2 overflow-y-auto"
				>
					<UserList
						users={$currentRoom?.users ?? []}
						userData={$currentRoom?.userData ?? {}}
						{isAdmin}
						{isOwner}
						on:setRole={e => {
							$socket?.emit('roomAction', roomId, {
								type: 'setRole',
								toUserId: e.detail.user,
								role: e.detail.role
							});
						}}
						on:setPermissions={e => {
							$socket?.emit('roomAction', roomId, {
								type: 'setPermissions',
								toUserId: e.detail.user,
								permissions: e.detail.permissions
							});
						}}
					/>
				</div>

				<div class="flex flex-col bg-white border-2 rounded-xl">
					<Activity
						actions={$currentRoom?.actions ?? []}
						getUserName={id =>
							$currentRoom?.userData[id]?.displayName ??
							'Unknown'}
					/>
				</div>
			</div>
		</div>
	</main>
{/if}

<style lang="postcss">
	.sidebar {
		grid-template-rows: 16rem minmax(0, 1fr);
	}

	.timer-control {
		@apply border-2 rounded-xl p-2 text-green-500 hocus-visible:bg-green-100 hocus-visible:border-green-500 outline-none transition
			disabled:hocus-visible:border-gray-200 disabled:text-gray-500 disabled:!bg-gray-100;
	}

	.main-timer-control {
		@apply w-16 flex items-center justify-center border-2 rounded-xl p-1 text-gray-500
			hocus-visible:bg-gray-100 hocus-visible:border-gray-500 outline-none transition
			disabled:hocus-visible:border-gray-200 disabled:text-gray-500 disabled:bg-gray-100;
	}

	.prep-timer-control {
		@apply border-2 rounded-xl px-2 py-0.5 flex items-center text-gray-500
			hocus-visible:bg-gray-100 hocus-visible:border-gray-500 outline-none transition
			disabled:hocus-visible:border-gray-200 disabled:text-gray-500 disabled:bg-gray-100;
	}
</style>
