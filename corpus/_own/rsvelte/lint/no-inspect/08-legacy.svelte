<script>
	export let prop;
	let doubled;
	$: doubled = prop * 2;
	$inspect(doubled);
</script>
<p>{doubled}</p>
