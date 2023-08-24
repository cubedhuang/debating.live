<script lang="ts">
	import { UserPermissions, type ActionData } from '$lib/types';
	import { formatDuration, timerTypeToName, userRoleToName } from '$lib/util';

	export let actions: ActionData[];
	export let getUserName: (userId: string) => string;

	let scrollableActivity: HTMLDivElement | null = null;

	function scrollToBottom() {
		if (scrollableActivity)
			scrollableActivity.scrollTop = scrollableActivity.scrollHeight;
	}

	$: if (actions) {
		requestAnimationFrame(() => scrollToBottom());
	}
</script>

<h2 class="p-6 pb-2 text-gray-500 border-b-2">Activity</h2>

<div
	class="mt-auto overflow-y-auto h-48 md:h-auto p-6 pt-4 text-xs"
	bind:this={scrollableActivity}
>
	{#each actions ?? [] as action}
		<p class="mt-2 gap-1">
			<span
				class="text-gray-500 font-mono font-semibold tracking-tighter inline-block mr-1"
			>
				{new Date(action.timestamp).toLocaleTimeString()}
			</span>

			{#if action.type === 'timerDone'}
				{timerTypeToName(action.timerType)} done
			{:else if action.type === 'startTimer' || action.type === 'resetTimer' || action.type === 'pauseTimer'}
				<b>{getUserName(action.userId)}</b>

				{#if action.type === 'startTimer'}
					started
				{:else if action.type === 'resetTimer'}
					reset
				{:else if action.type === 'pauseTimer'}
					paused
				{/if}

				{timerTypeToName(action.timerType)}
			{:else if action.type === 'addTime'}
				<b>{getUserName(action.userId)}</b>

				{#if action.seconds > 0}
					added {formatDuration(action.seconds)} to
				{:else if action.seconds < 0}
					removed {formatDuration(-action.seconds)} from
				{/if}

				{timerTypeToName(action.timerType)}
			{:else if action.type === 'userJoin' || action.type === 'userLeave'}
				<b>{getUserName(action.userId)}</b>

				{#if action.type === 'userJoin'}
					joined
				{:else}
					left
				{/if}
			{:else if action.type === 'setRole'}
				{#if action.userId === action.toUserId}
					<b>{getUserName(action.toUserId)}</b>

					is now a

					{userRoleToName(action.role)}
				{:else}
					<b>{getUserName(action.userId)}</b>

					made

					<b>{getUserName(action.toUserId)}</b>

					a {userRoleToName(action.role)}
				{/if}
			{:else if action.type === 'setPermissions'}
				<b>{getUserName(action.userId)}</b>

				{#if action.permissions === UserPermissions.Owner}
					transferred ownership to

					<b>{getUserName(action.toUserId)}</b>
				{:else if action.permissions === UserPermissions.Admin}
					made

					<b>{getUserName(action.toUserId)}</b>

					an admin
				{:else}
					removed admin from

					<b>{getUserName(action.toUserId)}</b>
				{/if}
			{/if}
		</p>
	{/each}
</div>

<style lang="postcss">
	b {
		@apply font-semibold;
	}
</style>
