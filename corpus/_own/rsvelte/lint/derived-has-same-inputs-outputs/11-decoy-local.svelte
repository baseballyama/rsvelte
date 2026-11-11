<script>
	export let count;
	function derived(s, f) {
		return f(s);
	}
	const a = { v: count };
	const d = derived(a, (b) => b.v);
	const note = "derived(a, (wrong) => wrong)";
</script>

{d}{note}
