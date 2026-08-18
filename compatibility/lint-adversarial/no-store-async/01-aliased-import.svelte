<script>
	import { writable as w, readable as r, derived as d } from 'svelte/store';

	const a = w(0, async (set) => {
		set(1);
	});
	const b = r(0, (set) => {
		set(1);
	});
	const c = d(a, async ($a, set) => {
		set($a);
	});
</script>

<p>{$a} {$b} {$c}</p>
