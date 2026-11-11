<script>
	import { writable } from 'svelte/store';

	function makeStore(writable) {
		return writable(0, async (set) => set(1));
	}

	const real = writable(0, async (set) => set(1));
	const fake = makeStore((v, fn) => ({ v, fn }));
</script>

<p>{$real} {fake}</p>
