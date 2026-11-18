<script>
	let v = $state('V');
</script>

{#if v}
	{@const c = $effect.tracking()}
	<b>{String(c)}</b>
{/if}
