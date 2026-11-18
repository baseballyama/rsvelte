<script>
	let count = $state(3);
</script>
{#if true}{@const count = () => 9}<p>{count}</p>{/if}<span>{count}</span>