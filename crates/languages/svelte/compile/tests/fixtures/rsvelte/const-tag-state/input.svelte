<script>
	let n = $state(1);
</script>
{#if n}{@const [a] = $state([1])}{a}{/if}
