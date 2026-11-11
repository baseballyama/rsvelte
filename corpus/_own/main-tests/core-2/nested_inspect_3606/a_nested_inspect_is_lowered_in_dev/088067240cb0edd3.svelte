<script>
	let a = $state(1);
	let d = $derived(a * 2);
	function f() {
		function h() {
			$inspect(a);
		}
		h();
	}
	f();
</script>
<b>{a}{d}</b>
