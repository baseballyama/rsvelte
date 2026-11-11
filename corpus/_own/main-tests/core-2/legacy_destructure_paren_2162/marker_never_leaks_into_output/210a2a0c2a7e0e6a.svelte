<script>
	let a = $state(1);
	const obj = { a: 1 };
	function f() {
		({ a } = obj);
	}
</script>
<button onclick={f}>{a}</button>