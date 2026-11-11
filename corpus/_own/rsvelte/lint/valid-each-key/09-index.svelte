<script>
	const items = ['a'];
</script>

{#each items as item, i (i)}
	<span>{item}</span>
{/each}
{#each items as item, i (idx)}
	<span>{item}{i}</span>
{/each}
