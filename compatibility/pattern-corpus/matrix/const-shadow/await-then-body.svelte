<script>
	let value = $state(0);
	let promise = Promise.resolve(1);
</script>

<button onclick={() => value++}>{value}</button>

{#await promise then result}
	{@const value = () => result}
	<p>{value}</p>
{/await}
