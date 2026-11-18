<script>
	let p = Promise.resolve('a');
	let d = 'x';
</script>

{#snippet body()}
	<slot name={d} />
{/snippet}
{@render body()}
{#await p then value}
	<slot name={value} />
{/await}
