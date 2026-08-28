<script>
	export let months = [];
</script>

{#each months as month}
	{@const value = month + 1}
	<p>{new Date(value).toLocaleString('default', { month: 'short' })}</p>
{/each}
