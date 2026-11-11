<script>
	let count = $state(4);
	let doubled = $derived(count * 2);
</script>
{#each [1] as i}{@const doubled = () => i}<p>{doubled}</p>{/each}<span>{doubled}</span>