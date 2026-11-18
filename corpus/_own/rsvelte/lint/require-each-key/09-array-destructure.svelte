<script>
	let pairs = [[1, 2]];
</script>

{#each pairs as [a, b]}
	<span>{a}{b}</span>
{/each}
{#each pairs as [a, b] (a)}
	<span>{a}{b}</span>
{/each}
