<script>
	let k = 1;
</script>

{#key k}
	{@debug k}
{/key}
<svelte:boundary>
	{@debug k}
	{#snippet failed(error)}
		{@debug error}
	{/snippet}
</svelte:boundary>
