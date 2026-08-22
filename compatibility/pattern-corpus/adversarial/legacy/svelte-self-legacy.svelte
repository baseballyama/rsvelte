<script>
	export let depth = 0;
	export let children = [];
</script>

{#if depth < 3}
	<ul>
		{#each children as child}
			<li>
				<svelte:self depth={depth + 1} children={child.children ?? []} />
			</li>
		{/each}
	</ul>
{:else}
	<slot name="deepest" {depth}>max</slot>
{/if}
