<script>
	let tree = $state({ label: 'root', children: [{ label: 'leaf', children: [] }] });
</script>

{#snippet node({ label, children })}
	<li>
		{label}
		{#if children.length}
			<ul>
				{#each children as child (child.label)}
					{@render node(child)}
				{/each}
			</ul>
		{/if}
	</li>
{/snippet}

<ul>
	{@render node(tree)}
</ul>
