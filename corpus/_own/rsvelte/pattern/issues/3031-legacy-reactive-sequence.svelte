<script>
	export let base = 1;
	let doubled, tripled;

	$: doubled = base * 2, tripled = base * 3;
</script>

<p>{doubled}{tripled}</p>
