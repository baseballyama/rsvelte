<script>
	let k = 1;
	let raw = '<b>x</b>';
</script>

{#key k}
	{@html raw}
{/key}
<svelte:boundary>
	{@html raw}
	{#snippet failed(error)}
		{@html String(error)}
	{/snippet}
</svelte:boundary>
