<script>
	let raw = '<b>x</b>';
</script>

{#snippet row(v)}
	{@html v}
{/snippet}
{@render row(raw)}
