<script>
	import { writable, derived, readable } from 'svelte/store';

	const count = writable(0);
	const doubled = derived(count, ($c) => $c * 2);
	const ticks = readable(0, () => () => {});
	const nested = writable({ a: { b: 1 } });

	$: sum = $count + $doubled + $ticks;
	$: ({ a: { b: deep } } = $nested);

	function bump() {
		$count += 1;
		$nested.a.b += 1;
	}
</script>

<button onclick={bump}>{sum}{deep}{$count}{$doubled}</button>
<p>{$nested.a.b}</p>
