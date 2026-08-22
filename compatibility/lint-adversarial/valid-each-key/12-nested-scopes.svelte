<script>
	const xs = [{ id: 1 }];
	const ys = [{ id: 2 }];
</script>

{#each xs as x (x.id)}
	{#each ys as y (x.id)}
		<b>{y.id}</b>
	{/each}
	{#each ys as x (x.id)}
		<b>{x.id}</b>
	{/each}
{/each}
