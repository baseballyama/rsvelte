<script>
	import { writable } from 'svelte/store';

	const list = writable([1]);
	const p = writable(Promise.resolve(1));
</script>

{#each list as item}<i>{item}</i>{/each}
{#await p then v}<i>{v}</i>{/await}
{#key list}<i>k</i>{/key}
