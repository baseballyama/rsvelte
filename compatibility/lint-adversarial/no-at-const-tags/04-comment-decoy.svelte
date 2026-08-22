<script>
	// TODO: migrate to $state and $derived later
	export let legacy;
</script>

{#if legacy}
	{@const doubled = legacy * 2}
	<span>{doubled}</span>
{/if}
