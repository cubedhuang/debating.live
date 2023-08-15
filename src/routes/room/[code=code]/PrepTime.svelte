<script lang="ts">
	import ArrowPathMini from '$lib/components/icons/ArrowPathMini.svelte';
	import MinusSmallMini from '$lib/components/icons/MinusSmallMini.svelte';
	import PlayMini from '$lib/components/icons/PlayMini.svelte';
	import PlusSmallMini from '$lib/components/icons/PlusSmallMini.svelte';

	export let side: 'Aff' | 'Neg' = 'Aff';
</script>

<div class="bg-white border-2 rounded-xl p-6">
	<div class="flex items-center">
		<div>
			<h2 class="text-gray-500">{side} Prep Time</h2>

			<p
				class="mt-2 text-4xl font-mono font-semibold {side === 'Aff'
					? 'text-blue-500'
					: 'text-red-500'}"
			>
				4:56
			</p>
		</div>

		<div class="ml-auto flex flex-col gap-0.5">
			<button
				class="border-2 rounded-xl p-2 text-green-500 hover:bg-green-100 hover:border-green-500 transition"
			>
				<PlayMini />
			</button>

			<button
				class="border-2 rounded-xl p-2 text-green-500 hover:bg-green-100 hover:border-green-500 transition
							disabled:hover:border-gray-200 disabled:text-gray-500 disabled:bg-gray-100"
				disabled
			>
				<ArrowPathMini />
			</button>
		</div>

		<div class="ml-2 flex flex-col gap-0.5">
			<button
				class="border-2 rounded-xl px-2 py-0.5 flex items-center text-gray-500 hocus-visible:bg-gray-100 hocus-visible:border-gray-500 transition"
			>
				<PlusSmallMini /> 1m
			</button>

			<button
				class="border-2 rounded-xl px-2 py-0.5 flex items-center text-gray-500 hocus-visible:bg-gray-100 hocus-visible:border-gray-500 transition"
			>
				<PlusSmallMini /> 10s
			</button>

			<button
				class="border-2 rounded-xl px-2 py-0.5 flex items-center text-gray-500 hocus-visible:bg-gray-100 hocus-visible:border-gray-500 transition"
			>
				<MinusSmallMini /> 10s
			</button>

			<button
				class="border-2 rounded-xl px-2 py-0.5 flex items-center text-gray-500 hocus-visible:bg-gray-100 hocus-visible:border-gray-500 transition"
			>
				<MinusSmallMini /> 1m
			</button>
		</div>
	</div>
</div>
