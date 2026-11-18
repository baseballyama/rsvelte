<script>
	let n = $state(0);
</script>

{#each ['a\tb'] as v}
	{#key v}
		<p>{v}{n}</p>
	{/key}
{/each}
