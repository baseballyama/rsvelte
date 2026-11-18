<script>
	let count = $state(4);
	let doubled = $derived(count * 2);
</script>
{#key count}{@const doubled = () => 1}<p>{doubled}</p>{/key}