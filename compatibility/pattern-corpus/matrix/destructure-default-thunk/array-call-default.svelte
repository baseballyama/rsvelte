<script>
	let props = $props();

	function f() {
		return 1;
	}

	let [a, b = f()] = $derived(props.list);
</script>

<p>{a}{b}</p>
