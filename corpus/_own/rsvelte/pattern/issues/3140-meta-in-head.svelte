<script>
	let n = $state(1);
</script>

<svelte:head>
	<svelte:body onclick={() => n++} />
</svelte:head>
