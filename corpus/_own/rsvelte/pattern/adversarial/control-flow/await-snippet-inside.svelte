<script>
	let p = $state(Promise.resolve([1, 2]));
</script>

{#await p}
	{#snippet spinner(label)}
		<i>{label}</i>
	{/snippet}
	{@render spinner('wait')}
{:then xs}
	{#snippet row(x)}
		<b>{x}</b>
	{/snippet}
	{#each xs as x}
		{@render row(x)}
	{/each}
{:catch e}
	<p>{e}</p>
{/await}
