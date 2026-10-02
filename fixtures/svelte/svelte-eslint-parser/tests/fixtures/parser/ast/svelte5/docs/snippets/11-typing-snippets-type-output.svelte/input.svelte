<script lang="ts" generics="T"> // T: unknown
	import type { Snippet } from 'svelte'; // Snippet: Snippet<Parameters>, Snippet: Snippet<Parameters>

	let { data, children, row }: { // data: unknown[], data: unknown[], children: Snippet<[]>, children: Snippet<[]>, row: Snippet<[unknown]>, row: Snippet<[unknown]>
		data: T[]; // data: unknown[], T: unknown
		children: Snippet; // children: Snippet<[]>, Snippet: Snippet<Parameters>
		row: Snippet<[T]>; // row: Snippet<[unknown]>, Snippet: Snippet<Parameters>, T: unknown
	} = $props(); // $props(): { data: unknown[]; children: Snippet<[]>; row: Snippet<[unknown]>; }
</script>

<table>
	{#if children} <!-- children: Snippet<[]> -->
		<thead>
			<tr>{@render children()}</tr> <!-- children(): { '{@render ...} must be called with a Snippet': "import type { Snippet } from 'svelte'"; } & unique symbol -->
		</thead>
	{/if}
	<tbody>
		{#each data as d} <!-- data: unknown[], d: unknown -->
			<tr>{@render row(d)}</tr> <!-- row(d): { '{@render ...} must be called with a Snippet': "import type { Snippet } from 'svelte'"; } & unique symbol -->
		{/each}
	</tbody>
</table>
