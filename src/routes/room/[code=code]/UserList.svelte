<script lang="ts">
	import Tooltip from '$lib/components/Tooltip.svelte';
	import StarMini from '$lib/components/icons/StarMini.svelte';
	import { UserPermissions, type PublicUserInfo } from '$lib/types';
	import { roles, userRoleToName } from '$lib/util';
	import UserControls from './UserControls.svelte';

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
</script>

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
							tooltip={user.permissions === UserPermissions.Admin
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
					<UserControls
						{user}
						{isOwner}
						on:setRole
						on:setPermissions
					/>
				{/if}
			</p>
		{/each}
	{/if}
{/each}
