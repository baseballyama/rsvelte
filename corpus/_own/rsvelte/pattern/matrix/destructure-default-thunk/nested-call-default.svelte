<script>
	let props = $props();

	function f() {
		return 1;
	}

	let {
		a,
		nested: { b = f() }
	} = $derived(props);
</script>

<p>{a}{b}</p>
