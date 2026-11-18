<script>
	let a = $state(1);
	let d = $derived(a * 2);
	function f() {
		function h() {
			$effect.pre(() => a);
		}
		h();
	}
	f();
</script>
<b>{a}{d}</b>
