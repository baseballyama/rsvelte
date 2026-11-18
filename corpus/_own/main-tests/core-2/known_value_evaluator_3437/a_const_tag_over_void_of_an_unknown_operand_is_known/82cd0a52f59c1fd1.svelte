<script>
	let { p } = $props();
</script>
{#if true}
	{@const c = void p}
	<b>{c}</b>
{/if}
