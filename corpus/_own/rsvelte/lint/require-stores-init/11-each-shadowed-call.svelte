<script>
	import { writable } from 'svelte/store';

	const rows = [() => 1];
</script>

<!-- `writable` here is the each context, not the import -->
{#each rows as writable}
	<p>{writable()}</p>
{/each}

<!-- the unshadowed template call IS the import -->
<p>{writable()}</p>
