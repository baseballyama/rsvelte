<script>
	import Comp from './01-component-basic.svelte';
	let items = [1];
	let k = 1;
</script>

<Comp>
	{#each items as item (item)}
		{#snippet children()}
			<p>{item}</p>
		{/snippet}
	{/each}
</Comp>
<Comp>
	{#key k}
		{#snippet children()}
			<p>b</p>
		{/snippet}
	{/key}
</Comp>
