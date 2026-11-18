<script>
	let items = $state([1]);
	let other = $state([2]);
</script>

{#each items as it}x{:else}{#snippet items()}y{/snippet}{@render items()}{/each}
