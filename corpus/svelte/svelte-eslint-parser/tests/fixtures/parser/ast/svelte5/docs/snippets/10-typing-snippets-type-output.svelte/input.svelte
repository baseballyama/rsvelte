<script lang="ts">
	import type { Snippet } from 'svelte'; // Snippet: Snippet<Parameters>, Snippet: Snippet<Parameters>

	let { data, children, row }: { // data: any[], data: any[], children: Snippet<[]>, children: Snippet<[]>, row: Snippet<[any]>, row: Snippet<[any]>
		data: any[]; // data: any[]
		children: Snippet; // children: Snippet<[]>, Snippet: Snippet<Parameters>
		row: Snippet<[any]>; // row: Snippet<[any]>, Snippet: Snippet<Parameters>
	} = $props(); // $props(): { data: any[]; children: Snippet<[]>; row: Snippet<[any]>; }
</script>

<table>
	{#if children} <!-- children: Snippet<[]> -->
		<thead>
			<tr>{@render children()}</tr> <!-- children(): { '{@render ...} must be called with a Snippet': "import type { Snippet } from 'svelte'"; } & unique symbol -->
		</thead>
	{/if}
	<tbody>
		{#each data as d} <!-- data: any[], d: any -->
			<tr>{@render row(d)}</tr> <!-- row(d): { '{@render ...} must be called with a Snippet': "import type { Snippet } from 'svelte'"; } & unique symbol -->
		{/each}
	</tbody>
</table>
