<script>
	/* eslint svelte/derived-has-same-inputs-outputs: "warn" */
	import { derived, writable } from 'svelte/store';

	const a = writable(0);
</script>

<p>{$derived(a, (x) => x)}</p>
{#each [derived(a, (y) => y)] as row}
	<p>{row}</p>
{/each}
<button onclick={() => derived(a, (z) => z)}>go</button>
