<script lang="ts">
	import type { Snippet } from 'svelte';

	let { data, children, row }: {
		data: any[];
		children: Snippet;
		row: Snippet<[any]>;
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
