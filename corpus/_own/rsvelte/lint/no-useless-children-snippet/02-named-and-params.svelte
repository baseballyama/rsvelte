<script>
	import Comp from './01-component-basic.svelte';
</script>

<Comp>
	{#snippet other()}
		<p>a</p>
	{/snippet}
</Comp>
<Comp>
	{#snippet children(item)}
		<p>{item}</p>
	{/snippet}
</Comp>
