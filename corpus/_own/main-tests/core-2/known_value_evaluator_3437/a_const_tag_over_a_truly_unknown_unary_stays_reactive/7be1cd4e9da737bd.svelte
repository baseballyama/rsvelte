<script>
	let { p } = $props();
</script>
{#if true}
	{@const c = !p}
	<b>{c}</b>
{/if}
