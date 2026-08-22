<script lang="ts" generics="T extends { id: string | number }, K extends keyof T">
	import type { Snippet } from 'svelte';

	interface Props {
		items: T[];
		field: K;
		row?: Snippet<[T[K], number]>;
	}

	let { items, field, row }: Props = $props();

	let firsts = $derived(items.map((it) => it[field]));
</script>

{#each items as item, i (item.id)}
	{#if row}
		{@render row(item[field], i)}
	{:else}
		<span>{String(item[field])}</span>
	{/if}
{/each}
<p>{firsts.length}</p>
