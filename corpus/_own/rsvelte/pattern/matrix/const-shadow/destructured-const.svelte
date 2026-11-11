<script>
	let value = $state(0);
	let point = { value: () => 'shadowed' };
</script>

<button onclick={() => value++}>{value}</button>

{#if value >= 0}
	{@const { value } = point}
	<p>{value}</p>
{/if}
