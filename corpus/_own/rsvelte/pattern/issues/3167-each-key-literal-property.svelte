<script>
	let list = $state([{ 'a-b': 1, a: 2 }]);
	const key = 'a';
</script>

{#each list as { 'a-b': z } (z)}
	<div>{z}</div>
{/each}
{#each list as { 'a-b': z }, i (i)}
	<div>{z}</div>
{/each}
{#each list as { [key]: z } (z)}
	<div>{z}</div>
{/each}
{#each list as { a: z } (z)}
	<div>{z}</div>
{/each}
