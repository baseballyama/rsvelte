<script>
	let open = $state(false);
</script>

{#if open}
	<p>open</p>
{:else}
	{#snippet row()}
		<li>row</li>
	{/snippet}

	{@render row()}
{/if}