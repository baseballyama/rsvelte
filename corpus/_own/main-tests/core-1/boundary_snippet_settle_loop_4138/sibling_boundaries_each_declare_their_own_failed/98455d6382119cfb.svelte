<script>
	let label = 'x';
</script>

<svelte:boundary>
	<p>a</p>
	{#snippet failed()}<p>1</p>{/snippet}
</svelte:boundary>
<svelte:boundary>
	<p>b</p>
	{#snippet failed()}<p>2</p>{/snippet}
</svelte:boundary>
