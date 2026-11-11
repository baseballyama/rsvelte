<script>
	let x = $state(0);
	let y = $state(0);
	$inspect(x, y);
</script>
<button onclick={() => { x++; y++; }}>{x}{y}</button>