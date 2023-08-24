<script lang="ts">
	export let tooltip: string;

	let element = 'div';
	let className = '';

	export { element as this, className as class };
</script>

<svelte:element this={element} class="relative group {className}">
	<slot />

	{#if tooltip}
		<div
			class="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 w-max bg-gray-700 text-white text-xs rounded-xl px-2 py-1 pointer-events-none
				opacity-0 translate-y-0.5 group-hover:opacity-100 group-hover:translate-y-0 transition"
		>
			{tooltip}
		</div>
	{/if}
</svelte:element>
