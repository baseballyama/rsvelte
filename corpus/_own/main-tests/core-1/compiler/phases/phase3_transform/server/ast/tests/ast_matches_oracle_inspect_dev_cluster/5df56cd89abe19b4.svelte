<script>
	let data = $state({ a: 1 });
	$inspect(data);
</script>
<button onclick={() => data.a++}>{data.a}</button>