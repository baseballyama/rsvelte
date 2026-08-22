<script>
	let v = $state('V');
</script>

{#if v}
	{@const c = $effect.root(() => () => {})}
	<b>{typeof c}</b>
{/if}
