<script>
	export let count;
	function wrap(f) {
		return f;
	}
	let fn, g;
	$: fn = wrap(() => count);
	$: g = count ? () => 1 : () => 2;
</script>

{fn}{g}
