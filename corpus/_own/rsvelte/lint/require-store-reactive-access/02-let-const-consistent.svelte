<script>
	import { writable } from 'svelte/store';

	let mut = writable(0);
	const fixed = writable(0);
</script>

{#if mut}<span>a</span>{/if}
{#if fixed}<span>b</span>{/if}
<p>{mut ? 'x' : 'y'}</p>
<p>{fixed && 'z'}</p>
<p>{!mut} {!fixed}</p>
