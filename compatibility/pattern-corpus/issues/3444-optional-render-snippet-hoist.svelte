<script>
	let n = $state(0);
</script>

{#snippet hoistable()}
	{#snippet inner()}
		<i>x</i>
	{/snippet}
	{@render inner?.()}
{/snippet}

{#snippet pinned()}
	{#snippet reads()}
		<i>{n}</i>
	{/snippet}
	{@render reads?.()}
{/snippet}

{@render hoistable()}
{@render pinned()}
