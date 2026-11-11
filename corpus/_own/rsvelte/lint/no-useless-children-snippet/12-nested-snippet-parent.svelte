<script>
	import Comp from './01-component-basic.svelte';
</script>

<Comp>
	{#snippet outer()}
		{#snippet children()}
			<p>a</p>
		{/snippet}
		{@render children()}
	{/snippet}
	{@render outer()}
</Comp>
