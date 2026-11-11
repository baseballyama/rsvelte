<script>
	export let count;
	$: doubled = count * 2;
	function g(doubled) {
		doubled = 1;
		return doubled;
	}
	function h() {
		let doubled;
		doubled = 2;
		return doubled;
	}
</script>

{doubled}{g(1)}{h()}
