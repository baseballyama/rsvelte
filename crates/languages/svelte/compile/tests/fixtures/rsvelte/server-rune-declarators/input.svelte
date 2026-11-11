<script>
	let items = $state([{ a: 0 }]);
	let start = $state.snapshot(items);
	function f() {
		const copy = $state.snapshot(items);
		return copy;
	}
</script>

<p>{JSON.stringify(start)} {f()}</p>
