<script>
	let { items } = $props();
</script>
<Component>
	{@const foo = items.length}
	{foo}
	<Component>
		{#snippet prop()}
			{foo}
		{/snippet}
	</Component>
	{#snippet prop()}
		{@const foo = items[0]}
		{foo}
	{/snippet}
</Component>
<Component>
	{@const bar = 'bar'}
	{#snippet prop()}
		{bar}
	{/snippet}
</Component>
