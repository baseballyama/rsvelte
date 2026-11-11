<script>
	let open = $state(false);
	let { row } = $props();
</script>

{#if open}
	{@render row()}
{/if}