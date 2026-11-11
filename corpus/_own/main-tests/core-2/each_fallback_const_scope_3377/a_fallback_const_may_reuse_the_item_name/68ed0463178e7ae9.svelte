<script>
	let items = $state([1]);
	let other = $state([2]);
</script>

{#each items as it}x{:else}{@const it = 1}{/each}
