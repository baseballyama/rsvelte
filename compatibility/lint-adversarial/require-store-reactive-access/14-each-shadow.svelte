<script>
	import { writable } from 'svelte/store';

	const s = writable(0);
	const rows = [1, 2];
</script>

<!-- `s` is rebound by the each context: the template reference is NOT the store -->
{#each rows as s}
	<p>{s + 1}</p>
	<p>{s ? 'y' : 'n'}</p>
{/each}

<!-- unshadowed control: both of these are the store -->
{#each rows as row}
	<p>{s + row}</p>
{/each}

<p>{$s}</p>
