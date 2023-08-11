<script lang="ts">
	import { page } from '$app/stores';
</script>

<div class="w-full h-full flex flex-col">
	<div class="flex flex-wrap justify-between">
		<p>
			Daniel &middot;
			<span class="text-red-500">Neg, 2nd</span>
		</p>

		<p>
			Room <span class="font-mono font-semibold">
				{$page.params.code}
			</span>
		</p>
	</div>

	<div class="mt-8 flex flex-col lg:flex-row lg:h-full gap-8">
		<div class="flex-1 flex flex-col">
			<div
				class="flex-1 flex flex-col justify-center text-center bg-white border-2 rounded-xl p-8"
			>
				<h2 class="text-gray-500">2nd Rebuttal (Neg)</h2>

				<p class="mt-2 text-5xl font-mono font-semibold">1:32</p>
			</div>

			<div class="mt-4 grid md:grid-cols-2 gap-2">
				<button class="md:place-self-start button button-gray">
					Back to Grand Crossfire
				</button>

				<button
					class="md:place-self-end button button-green row-start-1 md:row-start-auto"
				>
					Next to Grand Crossfire
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

		<div class="shrink-0 lg:w-56">
			<div class="bg-white border-2 rounded-xl p-6">
				<h2 class="text-gray-500 text-center mb-2">Judges</h2>

				{#each { length: 3 } as _, i}
					<p class="mt-1 line-clamp-1 break-all">
						Judges {i}
					</p>
				{/each}

				<h2 class="mt-4 text-gray-500 text-center">Competitors</h2>

				<p class="mt-2 flex justify-between gap-2">
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
			</div>
		</div>
	</div>
</div>
