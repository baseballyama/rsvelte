<script>
	import { writable } from 'svelte/store';

	const foo = writable({});
	const items = [1];
</script>

{#each items as it}
	{@const key = String(it)}
	<p>{$foo[key]}</p>
{/each}
