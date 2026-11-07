<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';

	type A = T
	let { data, children, row }:{
		data: A[];
		children: Snippet;
		row: Snippet<[A]>;
	} = $props();
</script>

<table>
	{#if children}
		<thead>
			<tr>{@render children()}</tr>
		</thead>
	{/if}
	<tbody>
		{#each data as d}
			<tr>{@render row(d)}</tr>
		{/each}
	</tbody>
</table>
