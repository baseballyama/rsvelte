<script>
	export let a;
	const cfg = 'runes: true';
</script>

{#if a}
	{@const c = cfg.length}
	<span>{c}</span>
{/if}
