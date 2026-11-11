<script>
	let a = $state(1);
	let d = $derived(a * 2);
	function f() {
		function h() {
			$inspect(d);
		}
		h();
	}
	f();
</script>
<b>{a}{d}</b>
