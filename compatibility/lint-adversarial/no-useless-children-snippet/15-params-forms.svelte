<script>
	import Comp from './01-component-basic.svelte';
</script>

<Comp>
	{#snippet children({ a })}
		<p>{a}</p>
	{/snippet}
</Comp>
<Comp>
	{#snippet children(...rest)}
		<p>{rest.length}</p>
	{/snippet}
</Comp>
<Comp>
	{#snippet children(a = 1)}
		<p>{a}</p>
	{/snippet}
</Comp>
<Comp>
	{#snippet children([a])}
		<p>{a}</p>
	{/snippet}
</Comp>
