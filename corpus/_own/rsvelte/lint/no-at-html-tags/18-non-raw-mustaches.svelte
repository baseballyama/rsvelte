<script>
	let raw = '<b>x</b>';
	let k = 1;
</script>

{raw}
{@debug raw}
{#if k}
	{@const doubled = k * 2}
	<span>{doubled}</span>
{/if}
{#snippet body()}<span>{raw}</span>{/snippet}
{@render body()}
<!-- {@html raw} -->
<span title="&#123;@html raw&#125;">{'{@html raw}'}</span>
