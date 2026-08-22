<script>
	import { writable } from 'svelte/store';

	const s = writable(0);
	const rows = [1];
</script>

{#each rows as row}
	{@const s = row * 2}
	<p>{s + 1}</p>
{/each}

{#each rows as row}
	{@const doubled = row * 2}
	<p>{s + doubled}</p>
{/each}
