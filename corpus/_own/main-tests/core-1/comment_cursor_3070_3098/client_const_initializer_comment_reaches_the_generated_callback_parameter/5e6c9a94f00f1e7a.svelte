<script>
	let v = $state(1);
	const s = (x) => x;
</script>

{#each [1] as i}{@const c = /* c */ v * i}<p>{c}</p>{/each}
