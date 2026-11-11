<script>
	import { writable, derived as d } from 'svelte/store';

	const a = writable(1);
	const b = writable(2);
	const c = d([a, b], ([$a, $b]) => $a + $b);

	let local = 0;

	$: $a = local + 1;
	$: local = $b * 2;
	$: if ($c > 3) {
		$a = 0;
	}
	$: ({ length } = String($c));

	function bump() {
		$a += 1;
		$b = $a;
	}
</script>

<button onclick={bump}>{$a}/{$b}/{$c}/{local}/{length}</button>
