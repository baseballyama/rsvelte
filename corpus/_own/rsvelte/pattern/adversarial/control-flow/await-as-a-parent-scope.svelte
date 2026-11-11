<script>
	import C from './C.svelte';

	let n = $state(1);
	const p = Promise.resolve(1);
	const sp = { id: 'x' };
</script>

{#await p}
	<b class="plain">pending {n}</b>
{:then v}
	{#each [v] as x (x)}
		{#if x}
			<i class:on={x > 0}>{x}</i>
		{/if}
	{/each}
	{#snippet inner(w)}
		<u style:color="red">{w}</u>
	{/snippet}
	{@render inner(v)}
{:catch e}
	<C>
		<s {...sp}>{e}</s>
	</C>
{/await}

{#await p then v}
	{@const doubled = v * 2}
	<b>{doubled}</b>
{/await}

<style>
	b {
		color: red;
	}

	.plain {
		color: blue;
	}

	.on {
		font-weight: bold;
	}
</style>
