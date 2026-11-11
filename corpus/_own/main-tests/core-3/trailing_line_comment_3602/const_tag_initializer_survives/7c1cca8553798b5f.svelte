<script>
	let flag = $state(true);
	let rows = $state([1]);
</script>

{#each rows as r (r)}
	{@const x = r * 2 // c
	}
	<b>{x}</b>
{/each}
