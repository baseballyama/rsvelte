<script>
	import C from './C.svelte';

	let n = $state(1);
</script>

<C>
	<svelte:fragment slot="a">
		<p class="deep">{n}</p>
	</svelte:fragment>
	<svelte:fragment slot="b">
		{#if n}
			<span class="deep">{n}</span>
		{/if}
	</svelte:fragment>
</C>

<svelte:boundary>
	{#each [n] as v (v)}
		<p class="deep">{v}</p>
	{/each}
</svelte:boundary>

<style>
	p.deep {
		color: red;
	}

	span.deep {
		color: blue;
	}

	:global(.untouched) .deep {
		color: green;
	}
</style>
