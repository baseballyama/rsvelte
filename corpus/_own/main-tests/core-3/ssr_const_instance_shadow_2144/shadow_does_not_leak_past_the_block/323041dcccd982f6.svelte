<script>
	let count = $state(4);
	let doubled = $derived(count * 2);
</script>
{#if count}{@const doubled = 7}<p>{doubled}</p>{/if}<span>{doubled}</span>