<script>
	import * as stores from 'svelte/store';

	const a = stores.writable(0, async (set) => set(0));
	const b = stores['readable'](0, async (set) => set(0));
	const c = stores.readable(0, (set) => set(0));
</script>

<p>{$a} {$b} {$c}</p>
