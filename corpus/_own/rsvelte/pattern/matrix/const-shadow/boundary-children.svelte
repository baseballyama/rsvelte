<script>
	let value = $state(0);
</script>

<button onclick={() => value++}>{value}</button>

<svelte:boundary>
	{@const value = () => 'boundary'}
	<p>{value}</p>
</svelte:boundary>
