<script>
	import { writable, derived } from 'svelte/store';

	const args = [0];
	const pair = [writable(1), ($v) => $v, 0];
	const a = writable(...args);
	const b = derived(...pair);
</script>

<p>{$a} {$b}</p>
