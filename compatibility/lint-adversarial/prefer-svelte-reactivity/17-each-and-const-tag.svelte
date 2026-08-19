<script>
	const rows = [1, 2];
	const m = new Map();
</script>

{#each rows as m}
	<p>{m}</p>
{/each}

{#each rows as row}
	{@const local = new Map()}
	<button onclick={() => local.set(row, row)}>{row}</button>
{/each}

<button onclick={() => m.set(1, 2)}>outer</button>
