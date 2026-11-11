<script>
	import { writable } from 'svelte/store';

	const s = writable(0);
	const p = Promise.resolve(1);
</script>

{#await p then s}
	<p>{s + 1}</p>
{/await}

{#await p}
	<p>loading</p>
{:catch s}
	<p>{s + 2}</p>
{/await}

{#await p then ok}
	<p>{s + ok}</p>
{/await}
