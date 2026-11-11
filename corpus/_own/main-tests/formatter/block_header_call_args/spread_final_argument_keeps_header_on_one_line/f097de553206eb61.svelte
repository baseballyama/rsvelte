<script>
	let alpha = 1;
	let restOfTheArguments = [];
	let someCalleeNameHere = { getGrid: (a, ...r) => [] };
</script>

{#if a}
	{#if b}
		{#each someCalleeNameHere.getGrid(alpha, ...restOfTheArguments) as m, id (id)}
			<div>{m}</div>
		{/each}
	{/if}
{/if}
