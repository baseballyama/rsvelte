<script>
	import Comp from './01-component-basic.svelte';
</script>

<Comp>
	{#snippet Children()}
		<p>a</p>
	{/snippet}
</Comp>
<Comp>
	{#snippet children_()}
		<p>b</p>
	{/snippet}
</Comp>
<Comp>
	{#snippet child()}
		<p>c</p>
	{/snippet}
</Comp>
<Comp>
	{#snippet _children()}
		<p>d</p>
	{/snippet}
</Comp>
