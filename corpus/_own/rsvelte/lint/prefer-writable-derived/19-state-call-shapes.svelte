<script>
	let src = $state(0);
	let a = $state();
	let b = $state;
	let c = $state.snapshot(src);
	function state(v) {
		return v;
	}
	let d = state(0);
	$effect(() => {
		a = src;
	});
	$effect(() => {
		b = src;
	});
	$effect(() => {
		c = src;
	});
	$effect(() => {
		d = src;
	});
</script>

{a}{b}{c}{d}
