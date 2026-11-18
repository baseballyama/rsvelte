<script>
	let n = 0;
</script>

<svelte:boundary>
	<p>a</p>
	{#snippet failed(x)}<b>1{n}</b>{/snippet}
</svelte:boundary>

<svelte:boundary>
	{#snippet failed(y)}<i>2{y}</i>{/snippet}
	<p>b</p>
</svelte:boundary>
