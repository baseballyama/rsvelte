<script>
	let open = $state(false);

	function track() {
		return () => {};
	}
</script>

{#if open}
	{#snippet row()}
		<li {@attach track()}>row</li>
	{/snippet}

	{@render row()}
{/if}
