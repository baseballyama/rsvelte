<script>
	let n = $state(0);
</script>

{#snippet hoistable(a)}
	{#snippet inner(b)}
		<i>{b}</i>
	{/snippet}
	{@render inner(a + '!')}
{/snippet}

{#snippet pinned(a)}
	{#snippet reads(b)}
		<i>{b}{n}</i>
	{/snippet}
	{@render reads(a)}
{/snippet}

{@render hoistable('x')}
{@render pinned('y')}
<button onclick={() => n++}>{n}</button>
