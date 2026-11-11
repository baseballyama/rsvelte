<script>
	let items = [];
</script>

{#each items as item}
	<span>{item}</span>
{:else}
	<span>empty</span>
{/each}
