<script module lang="ts">
	export type Row = { id: number; label: string };
	export const VERSION = '1' as const;

	export function make(id: number): Row {
		return { id, label: `#${id}` };
	}

	const preloaded = await Promise.resolve(make(0));
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		rows?: Row[];
		children?: Snippet;
	}

	let { rows = [make(1)], children }: Props = $props();
	let selected = $state<Row | null>(null);
	const labels = $derived(rows.map((r) => r.label));
</script>

<p>{VERSION} {preloaded.label} {labels.join(',')}</p>
{#each rows as row (row.id)}
	<button onclick={() => (selected = row)}>{row.label}</button>
{/each}
<p>{selected?.label ?? 'none'}</p>
{@render children?.()}
