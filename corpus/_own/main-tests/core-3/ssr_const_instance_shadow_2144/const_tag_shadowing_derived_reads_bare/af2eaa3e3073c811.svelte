<script>
	let count = $state(4);
	let doubled = $derived(count * 2);
</script>
{#if count}{@const doubled = () => 'x'}<p>{doubled}</p>{/if}