<script>
	let n = 7;
	const pr = Promise.resolve(1);
	let items = [1, 2];
</script>
{#each items as n}<b>{n}</b>{:else}<i>{n}</i>{/each}