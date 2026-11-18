<script>
	import { SvelteMap as Map, SvelteSet } from 'svelte/reactivity';

	const m = new Map();
	m.set('a', 1);
	const s = new SvelteSet();
	s.add(1);
</script>

<p>{m.size} {s.size}</p>
