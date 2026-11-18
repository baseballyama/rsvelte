<script>
	export let x;

	$: p = x + 1;
	$: q = p + 1;
</script>

{p}{q}
