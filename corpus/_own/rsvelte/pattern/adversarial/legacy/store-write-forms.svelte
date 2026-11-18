<script>
	import { writable, derived } from 'svelte/store';
	const count = writable(0);
	const obj = writable({ a: { b: 1 } });
	const doubled = derived(count, (c) => c * 2);
	function bump() {
		$count++;
		$count += 2;
		--$count;
		$obj.a.b = $count;
		$obj = { a: { b: $doubled } };
	}
	$: quad = $doubled * 2;
</script>

<button onclick={bump}>{$count} / {$doubled} / {quad}</button>
<p>{$obj.a.b}</p>
