<script>
	export let x;

	// B
	$: p = x + 1;
	// C
	$: q = p + 1;
</script>

{p}{q}
