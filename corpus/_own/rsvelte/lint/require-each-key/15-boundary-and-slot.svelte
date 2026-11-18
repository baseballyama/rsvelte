<script>
	import C from './01-unkeyed-basic.svelte';
	let items = [1];
</script>

<svelte:boundary>
	{#each items as item}
		<span>{item}</span>
	{/each}
</svelte:boundary>
<C>
	<svelte:fragment slot="body">
		{#each items as item}
			<span>{item}</span>
		{/each}
	</svelte:fragment>
</C>
