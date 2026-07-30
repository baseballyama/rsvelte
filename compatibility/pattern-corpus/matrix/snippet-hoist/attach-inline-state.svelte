<script>
	let count = $state(0);
</script>

{#snippet meter()}
	<div {@attach (node) => node.setAttribute('data-count', String(count))}>{count}</div>
{/snippet}

{@render meter()}
