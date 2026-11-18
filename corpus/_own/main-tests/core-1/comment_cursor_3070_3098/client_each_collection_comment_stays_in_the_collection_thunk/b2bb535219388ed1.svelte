<script>
	let v = $state(1);
	const s = (x) => x;
</script>

{#each [/* c */ v] as i}<p>{i}</p>{/each}
