<script>
	import { writable, readable } from 'svelte/store';

	let mutable = writable(0);
	const fixed = writable(1);

	function swap() {
		mutable = readable(2);
	}
</script>

<button onclick={swap}>swap</button>

<!-- non-consistent positions report for both; consistent positions only for `const` -->
<p>{mutable + 1}</p>
<p>{fixed + 1}</p>
{#if mutable}ok{/if}
{#if fixed}ok{/if}
<p>{mutable === fixed}</p>
<p>{!mutable}{!fixed}</p>
