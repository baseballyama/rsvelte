<script>
	let count = $state(4);
	let doubled = $derived(count * 2);
</script>
{#if count}{@const doubled = () => 1}<div><p>{doubled}</p></div>{/if}<span>{doubled}</span>