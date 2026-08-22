<script lang="ts" generics="T extends { id: string }, U = string">
	type Row = { item: T; extra: U };

	let { items, render }: { items: T[]; render?: (row: Row) => string } = $props();

	const first = $derived(items[0] as T | undefined);

	function pick<K extends keyof T>(obj: T, key: K): T[K] {
		return obj[key];
	}
</script>

{#each items as item (item.id)}
	<p>{pick(item, 'id' as keyof T)}</p>
{/each}
<p>{first?.id ?? ''}{render ? 1 : 0}</p>
