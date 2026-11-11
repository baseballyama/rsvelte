<script>
	import C from './C.svelte';

	let picked = $state('a');
	let other = $state('x');
</script>

<svelte:boundary>
	<input type="radio" bind:group={picked} value="a" />
	{#snippet failed(e)}
		<input type="radio" bind:group={picked} value="b" />
		<span>{e.message}</span>
	{/snippet}
</svelte:boundary>

<C>
	<svelte:fragment slot="s">
		<input type="radio" bind:group={other} value="x" />
	</svelte:fragment>
</C>
