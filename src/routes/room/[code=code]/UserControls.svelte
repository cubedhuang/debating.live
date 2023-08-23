<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { fly } from 'svelte/transition';

	import type { UserRole } from '$lib/types';
	import { roles, userRoleToName } from '$lib/util';

	import EllipsisHorizontalMini from '$lib/components/icons/EllipsisHorizontalMini.svelte';

	export let currentRole: UserRole;

	let popup = false;

	const dispatch = createEventDispatcher<{
		setRole: UserRole;
	}>();
</script>

<svelte:window
	on:click={() => {
		popup = false;
	}}
	on:keydown={e => {
		if (e.key === 'Escape') {
			popup = false;
		}
	}}
/>

<div class="relative">
	<button
		class="text-gray-500 hocus-visible:text-gray-800 transition"
		on:click|stopPropagation={() => {
			popup = !popup;
		}}
	>
		<EllipsisHorizontalMini />
	</button>

	{#if popup}
		<div
			transition:fly={{ y: 4, duration: 150 }}
			class="w-max absolute text-xs right-0 top-full
				flex flex-col
				bg-white shadow-lg border-2 p-2 rounded-xl"
		>
			{#each roles.filter(r => r !== currentRole) as role}
				<button
					on:click={() => dispatch('setRole', role)}
					class="px-4 py-2 rounded-xl hocus-visible:bg-gray-50 transition"
				>
					Make {userRoleToName(role)}
				</button>
			{/each}
		</div>
	{/if}
</div>
