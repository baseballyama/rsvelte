<script>
	import { writable, derived } from 'svelte/store';

	// async generator function expression
	const a = writable(0, async function* (set) {
		yield set(1);
	});
	// async, but wrapped so the argument node is not a function
	const b = writable(0, (async () => {})());
	// non-async generator
	const c = writable(0, function* (set) {
		yield set(1);
	});
	// async in the THIRD argument only
	const d = derived(a, (x) => x, async () => {});
</script>

<p>{a}{b}{c}{d}</p>
