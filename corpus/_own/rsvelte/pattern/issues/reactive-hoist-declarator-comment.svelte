<script>
	export let x;

	// A
	$: if (x) {
		x = 1;
	}

	// B
	$: p = x + 1;
	// C
	$: q = p + 1;
</script>

{p}{q}
