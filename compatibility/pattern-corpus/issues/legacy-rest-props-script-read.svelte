<script>
	export let declared;

	function inspect() {
		const original = $$props.extra;
		const rest = $$restProps.extra;

		delete $$restProps.extra;
		return [original, rest];
	}
</script>

<button onclick={inspect}>{declared}</button>
<pre>{JSON.stringify($$restProps)}</pre>
