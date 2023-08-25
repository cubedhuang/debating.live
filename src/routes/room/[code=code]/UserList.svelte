<script lang="ts">
	import Tooltip from '$lib/components/Tooltip.svelte';
	import EllipsisHorizontalMini from '$lib/components/icons/EllipsisHorizontalMini.svelte';
	import StarMini from '$lib/components/icons/StarMini.svelte';
	import { UserPermissions, type PublicUserInfo, UserRole } from '$lib/types';
	import { roles, userRoleToName } from '$lib/util';
	import { fly } from 'svelte/transition';
	import { createEventDispatcher } from 'svelte';

	export let users: string[];
	export let userData: Record<string, PublicUserInfo>;
	export let isAdmin = false;
	export let isOwner = false;

	$: usersPerRole = roles.map(role => ({
		role,
		users: users
			.filter(userId => userData[userId].role === role)
			.map(userId => userData[userId])
	}));

	const dispatch = createEventDispatcher<{
		setRole: { user: string; role: UserRole };
		setPermissions: { user: string; permissions: UserPermissions };
	}>();

	let popup: PublicUserInfo | null;
	let top = 0;
	let left = 0;
</script>

<svelte:window
	on:click={() => {
		popup = null;
	}}
	on:keydown={e => {
		if (e.key === 'Escape') {
			popup = null;
		}
	}}
	on:resize={() => {
		popup = null;
	}}
	on:scroll={() => {
		popup = null;
	}}
/>

<div class="bg-white border-2 rounded-xl p-6 pt-2 overflow-y-auto">
	{#each usersPerRole as { role, users }}
		{#if users.length}
			<h2 class="mt-4 text-gray-500">
				{userRoleToName(role)}s &mdash; {users.length}
			</h2>

			{#each users as user}
				<p class="mt-1 flex justify-between gap-2">
					<span class="flex gap-1">
						<span class="line-clamp-1 break-all">
							{user.displayName}
						</span>

						{#if user.permissions === UserPermissions.Admin || user.permissions === UserPermissions.Owner}
							<Tooltip
								tooltip={user.permissions ===
								UserPermissions.Admin
									? 'Room Admin'
									: 'Room Owner'}
								this="span"
								class="text-amber-500 translate-y-px cursor-pointer"
							>
								<StarMini />
							</Tooltip>
						{/if}
					</span>

					<!-- <span class="text-blue-500">Aff</span> -->

					{#if isAdmin}
						<button
							class="text-gray-500 hocus-visible:text-gray-800 transition"
							on:click|stopPropagation={e => {
								if (popup === user) {
									popup = null;
								} else {
									popup = user;

									const rect =
										e.currentTarget.getBoundingClientRect();
									top = rect.bottom;
									left = rect.right;
								}
							}}
						>
							<EllipsisHorizontalMini />
						</button>
					{/if}
				</p>
			{/each}
		{/if}
	{/each}
</div>

{#if popup}
	{@const user = popup}

	<div
		class="fixed top-0 left-0"
		transition:fly|local={{ y: 4, duration: 150 }}
	>
		{#key user.userId}
			<div
				transition:fly|local={{ y: 4, duration: 150 }}
				class="z-10 w-max mt-1 fixed text-xs
					flex flex-col bg-white shadow-lg border-2 p-2 rounded-xl
					-translate-x-full"
				style:top={top + 'px'}
				style:left={left + 'px'}
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
		{/key}
	</div>
{/if}
