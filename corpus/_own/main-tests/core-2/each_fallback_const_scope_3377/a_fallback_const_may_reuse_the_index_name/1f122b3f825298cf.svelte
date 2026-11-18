<script>
	let items = $state([1]);
	let other = $state([2]);
</script>

{#each items as it, i}x{:else}{@const i = 1}{/each}
