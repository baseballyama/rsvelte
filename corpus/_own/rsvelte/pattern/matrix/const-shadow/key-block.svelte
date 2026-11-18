<script>
	let value = $state(0);
</script>

<button onclick={() => value++}>{value}</button>

{#key value}
	{@const value = () => 'keyed'}
	<p>{value}</p>
{/key}
