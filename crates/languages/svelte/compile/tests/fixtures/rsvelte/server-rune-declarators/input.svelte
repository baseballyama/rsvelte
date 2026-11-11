<script>
	let items = $state([{ a: 0 }]);
	let start = $state.snapshot(items);
	let eager = $state.eager(items);
	let pending = $effect.pending();
	function f() {
		const copy = $state.snapshot(items);
		return copy;
	}
</script>

<p>{JSON.stringify(start)} {f()} {eager} {pending}</p>
