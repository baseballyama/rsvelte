<script>
	import { writable } from 'svelte/store';

	const rows = [(v, f) => f];
</script>

{#each rows as writable}
	<p>{writable(0, async () => {})}</p>
{/each}

<p>{writable(0, async () => {})}</p>
