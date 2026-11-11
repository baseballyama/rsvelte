<script>
	let a = $state(1);
	let d = $derived(a * 2);
	function f() {
		$inspect(a);
	}
	f();
</script>
<b>{a}{d}</b>
