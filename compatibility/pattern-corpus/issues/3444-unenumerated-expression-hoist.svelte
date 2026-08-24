<script module>
	const mo = { a: 1 };
</script>

<script>
	let io = $state({ a: 1 });
</script>

{#snippet hoistable()}
	{@const v = mo?.a}
	<i>{v}{mo?.[0]}</i>
{/snippet}

{#snippet pinned()}
	{@const v = io?.a}
	<i>{v}</i>
{/snippet}

{@render hoistable()}
{@render pinned()}
