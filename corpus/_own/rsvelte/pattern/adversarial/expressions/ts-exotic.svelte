<script lang="ts">
	import type { Snippet } from 'svelte';

	type Row<T> = { id: number; data: T };

	interface Props {
		rows?: Row<string>[];
		render?: Snippet<[Row<string>]>;
	}

	let { rows = [], render }: Props = $props();

	let first = $derived(rows[0] satisfies Row<string> | undefined);
	let ids = $derived(rows.map((r): number => r.id));

	function assertRow(r: unknown): asserts r is Row<string> {
		if (typeof r !== 'object') throw new Error();
	}

	function cast<T>(v: unknown): T {
		return v as T;
	}
	let widened = $state<string | null>(null);
	let narrowed = $derived((widened ?? '') as `${string}`);
</script>

{#each rows as row (row.id)}
	{@render render?.(row)}
{/each}
<p>{first?.id ?? cast<number>(ids.length)}:{narrowed}</p>
