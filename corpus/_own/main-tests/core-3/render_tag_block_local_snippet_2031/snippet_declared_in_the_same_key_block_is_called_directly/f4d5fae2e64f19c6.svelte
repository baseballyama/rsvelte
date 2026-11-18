<script>
	let id = $state(0);
</script>

{#key id}
	{#snippet row()}
		<li>row</li>
	{/snippet}

	{@render row()}
{/key}