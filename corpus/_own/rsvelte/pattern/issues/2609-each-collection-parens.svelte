<script>
	let servers = null;
	let ready = [];
	let box = { list: [] };
</script>

{#each servers ?? [] as connection}
	<input bind:value={connection} />
{/each}

{#each box?.list as entry}
	<input bind:value={entry} />
{/each}

{#each ready as item}
	<input bind:value={item} />
{/each}
