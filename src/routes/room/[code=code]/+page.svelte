<script lang="ts">
	import { page } from '$app/stores';
	import Backward from '$lib/components/icons/Backward.svelte';
	import Forward from '$lib/components/icons/Forward.svelte';
</script>

<div
	class="md:h-screen px-8 lg:px-20 py-20 max-w-screen-2xl mx-auto flex flex-col"
>
	<div class="flex flex-wrap justify-between h-12">
		<p>
			Daniel &middot;
			<span class="text-red-500">Neg (2nd)</span>
		</p>

		<p>
			Room <span class="font-mono font-semibold">
				{$page.params.code}
			</span>
		</p>
	</div>

	<div class="flex-1 flex flex-col md:flex-row gap-8">
		<div class="flex-1 flex flex-col">
			<div
				class="flex-1 flex flex-col justify-center text-center bg-white border-2 rounded-xl p-8"
			>
				<h2 class="text-gray-500">2nd Rebuttal (Neg)</h2>

				<p class="mt-2 text-5xl font-mono font-semibold">1:32</p>
			</div>

			<div
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
			</div>

			<div class="mt-8 gap-4 grid grid-cols-2">
				<div class="bg-white border-2 rounded-xl p-6">
					<h2 class="text-center text-gray-500">Aff Prep Time</h2>

					<p
						class="mt-2 text-3xl text-center font-mono font-semibold text-blue-500"
					>
						4:56
					</p>
				</div>

				<div class="bg-white border-2 rounded-xl p-6">
					<h2 class="text-center text-gray-500">Neg Prep Time</h2>

					<p
						class="mt-2 text-3xl text-center font-mono font-semibold text-red-500"
					>
						4:56
					</p>
				</div>
			</div>
		</div>

		<div
			class="shrink-0 md:w-56 lg:w-64 xl:w-80 grid sidebar md:max-h-[calc(100vh-13rem)] gap-8"
		>
			<div class="bg-white border-2 rounded-xl p-6 overflow-y-auto">
				<h2 class="text-gray-500">Judges &mdash; 1</h2>

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
				{/each}
			</div>

			<div class="flex flex-col bg-white border-2 rounded-xl">
				<h2 class="p-6 pb-2 text-gray-500 border-b-2">Activity</h2>

				<div
					class="mt-auto overflow-y-auto h-48 md:h-auto p-6 pt-0 flex flex-col gap-2 text-xs"
				>
					{#each { length: 30 } as _}
						<p>
							<span class="text-gray-500">
								{new Date().toLocaleTimeString()}
							</span>

							<span class="font-semibold">Daniel</span>

							added 10 seconds to Aff Prep Time
						</p>
					{/each}
				</div>
			</div>
		</div>
	</div>
</div>

<style lang="postcss">
	.sidebar {
		grid-template-rows: 16rem minmax(0, 1fr);
	}
</style>
