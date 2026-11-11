<script>
	const base = 10;
	let count = $state('shadowed');
</script>

{#snippet row(count = base, { title = `t${count}` } = {})}
	<p>{count}:{title}</p>
{/snippet}

{@render row()}
{@render row(1)}
<p>{count}</p>
