<script>
	export let x;

	// A
	let y = 1;
	$: p = x + y;
</script>

{p}
