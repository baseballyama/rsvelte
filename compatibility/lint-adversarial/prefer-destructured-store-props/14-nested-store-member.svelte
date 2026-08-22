<script>
	import { writable } from 'svelte/store';

	const foo = writable({});
	const bar = writable({});
	const items = [1, 2];
</script>

<!-- the OUTER access only ever sees `$foo`; the each binding lives in the inner one -->
{#each items as item}
	<p>{$foo[$bar[item]]}</p>
	<p>{$foo[$bar.direct]}</p>
{/each}

<p>{$foo[$bar.direct]}</p>
