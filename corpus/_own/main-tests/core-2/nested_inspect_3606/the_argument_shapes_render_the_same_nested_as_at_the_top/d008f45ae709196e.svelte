<script>
	let a = $state(1);
	let d = $derived(a * 2);
	function f() {
		$inspect(a, a + 1);
	}
	f();
</script>
<b>{a}{d}</b>
