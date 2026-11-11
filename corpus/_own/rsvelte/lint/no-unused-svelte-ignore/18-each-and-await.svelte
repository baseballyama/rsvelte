<script>
	const rows = [1, 2];
	const p = Promise.resolve(1);
</script>
{#each rows as row}
	<!-- svelte-ignore a11y_missing_attribute -->
	<img src="row-{row}.png" />
{/each}
{#await p then value}
	<!-- svelte-ignore a11y_missing_attribute -->
	<img src="await-{value}.png" alt="ok" />
{/await}
