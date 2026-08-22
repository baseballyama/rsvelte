<script>
	import * as ns from 'svelte/store';

	// literal computed key — a store
	const a = ns['writable'](0);
	// concatenated constant key — still `writable` after constant folding
	const b = ns['writ' + 'able'](0);
	// template literal key
	const c = ns[`readable`](0);
</script>

<p>{a + 1}</p>
<p>{b + 1}</p>
<p>{c + 1}</p>
