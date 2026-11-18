<script>
	let count = $state(0);
	$inspect(count);
</script>
<button onclick={() => count++}>{count}</button>