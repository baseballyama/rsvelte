<script>
	let x = $state(0);
	$inspect({x}, [x]);
</script>
<button onclick={() => x++}>{x}</button>