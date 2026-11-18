<script>
	let value = $state(0);
</script>

<button onclick={() => value++}>{value}</button>

{#snippet row()}
	{@const value = () => 'snippet'}
	<p>{value}</p>
{/snippet}

{@render row()}
