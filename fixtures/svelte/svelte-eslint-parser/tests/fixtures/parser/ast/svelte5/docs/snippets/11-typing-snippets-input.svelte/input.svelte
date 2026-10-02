<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';

	let { data, children, row }: {
		data: T[];
		children: Snippet;
		row: Snippet<[T]>;
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
