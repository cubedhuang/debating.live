<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { fly } from 'svelte/transition';

	import {
		UserPermissions,
		type PublicUserInfo,
		type UserRole
	} from '$lib/types';
	import { roles, userRoleToName } from '$lib/util';

	import EllipsisHorizontalMini from '$lib/components/icons/EllipsisHorizontalMini.svelte';

	export let user: PublicUserInfo;
	export let isOwner = false;

	let popup = false;

	const dispatch = createEventDispatcher<{
		setRole: { user: string; role: UserRole };
		setPermissions: { user: string; permissions: UserPermissions };
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
			class="z-10 w-max absolute text-xs right-0 top-full
				flex flex-col
				bg-white shadow-lg border-2 p-2 rounded-xl"
		>
			{#each roles.filter(r => r !== user.role) as role}
				<button
					on:click={() =>
						dispatch('setRole', { user: user.userId, role })}
					class="px-4 py-2 rounded-xl hocus-visible:bg-gray-100 transition"
				>
					Make {userRoleToName(role)}
				</button>
			{/each}

			{#if isOwner && user.permissions !== UserPermissions.Owner}
				<div class="h-px mx-4 my-2 bg-gray-200" />

				{#if user.permissions === UserPermissions.Admin}
					<button
						on:click={() =>
							dispatch('setPermissions', {
								user: user.userId,
								permissions: UserPermissions.Default
							})}
						class="px-4 py-2 rounded-xl hocus-visible:bg-gray-100 transition"
					>
						Remove Admin
					</button>
				{:else}
					<button
						on:click={() =>
							dispatch('setPermissions', {
								user: user.userId,
								permissions: UserPermissions.Admin
							})}
						class="px-4 py-2 rounded-xl hocus-visible:bg-gray-100 transition"
					>
						Make Admin
					</button>
				{/if}

				<button
					on:click={() =>
						dispatch('setPermissions', {
							user: user.userId,
							permissions: UserPermissions.Owner
						})}
					class="px-4 py-2 rounded-xl hocus-visible:bg-gray-100 text-red-500 transition"
				>
					Transfer Ownership
				</button>
			{/if}
		</div>
	{/if}
</div>
