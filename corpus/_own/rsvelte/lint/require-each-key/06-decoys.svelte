<script>
	const items = [1];
	const s = '{#each items as x}';
	// {#each items as decoy}
</script>

<!-- {#each items as html}{/each} -->
{'{#each items as text}'}
{#each items as item}
	<span>{s}{item}</span>
{/each}
