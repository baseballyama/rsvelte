<script>
	let { depth = 0 } = $props();
	let n = $state(1);
</script>

{#if depth < 1}
	<svelte:self depth={depth + 1}>
		{@const c = n}
		<b>{c}</b>
	</svelte:self>
{/if}
