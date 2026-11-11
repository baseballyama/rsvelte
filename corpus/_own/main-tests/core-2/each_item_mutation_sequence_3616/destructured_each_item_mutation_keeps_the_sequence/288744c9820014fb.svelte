<script>
	let rows = $state([{ nested: { value: 0 } }]);
</script>

{#each rows as { nested }}
	<button onclick={() => nested.value = 1}>x</button>
{/each}
