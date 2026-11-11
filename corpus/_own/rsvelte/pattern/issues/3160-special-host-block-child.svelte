<script>
	let n = $state(1);
</script>

<svelte:head>
	{#if n}<title>t</title>{/if}
</svelte:head>
<svelte:boundary>
	{#if n}<b>x</b>{/if}
</svelte:boundary>
