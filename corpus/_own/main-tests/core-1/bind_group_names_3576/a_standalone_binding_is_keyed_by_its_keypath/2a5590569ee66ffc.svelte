<script>
	let rows = $state([{ picked: [], other: [] }]);
	let top = $state([]);
	let top2 = $state([]);
</script>

<input type="radio" value={1} bind:group={top} />
<input type="radio" value={2} bind:group={top} />
