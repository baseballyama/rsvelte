<script>
	let count = $state(0);
</script>

{#snippet warning()}
	{let x = 1}
	<li>{x}</li>
{/snippet}

<p>{count}</p>
{@render warning()}