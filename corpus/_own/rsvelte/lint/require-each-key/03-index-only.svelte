<script>
	const items = ['a'];
</script>

{#each items as item, i}
	<span>{i}:{item}</span>
{/each}
{#each items as item, i (i)}
	<span>{i}</span>
{/each}
