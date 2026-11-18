<script>
	let value = $state(0);
	let rows = [1, 2];
</script>

<button onclick={() => value++}>{value}</button>

{#each rows as row}
	{@const value = () => row}
	<p>{value}</p>
{/each}
