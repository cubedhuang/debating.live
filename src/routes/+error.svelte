<script lang="ts">
	import { page } from '$app/stores';
</script>

<h1>Error: {$page.status}</h1>

<p class="mt-4 text-center">{$page.error?.message}</p>

<a href="/" class="mt-4 w-fit block mx-auto button button-blue">Home</a>
