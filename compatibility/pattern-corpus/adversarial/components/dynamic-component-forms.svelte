<script>
	let { A, B, useA } = $props();
	const Pick = $derived(useA ? A : B);
</script>

<Pick x="1" />
<svelte:component this={useA ? A : B} y="2" />
{#if Pick}<Pick.Nested z="3" />{/if}
