<script>
	let v = $state(1);
</script>

{#each [1] as i}{@const c = /* c */ v * i}<p>{c}</p>{/each}
