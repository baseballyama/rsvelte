<script>
	let count = $state(4);
	let doubled = $derived(count * 2);
</script>
{#if count}{@const doubled = () => 1}<p title={doubled}>x</p>{/if}