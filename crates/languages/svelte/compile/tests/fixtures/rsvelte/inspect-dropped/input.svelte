<script>
	let a = $state(1);
	let b = $derived(a * 2);
	$inspect(a, b);
	$inspect(a).with(console.trace);
	function f() {
		$inspect.trace('f');
		$inspect(b);
		return a;
	}
</script>

<button onclick={() => { $inspect(a); a++; }}>{f()}</button>
