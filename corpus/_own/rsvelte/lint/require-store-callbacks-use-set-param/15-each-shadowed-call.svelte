<script>
	import { readable } from 'svelte/store';

	const rows = [(v, f) => f];
</script>

{#each rows as readable}
	<p>{readable(0, (start) => start())}</p>
{/each}

<p>{readable(0, (start) => start())}</p>
