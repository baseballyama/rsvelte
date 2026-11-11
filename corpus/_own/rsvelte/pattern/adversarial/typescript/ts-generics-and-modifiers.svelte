<script lang="ts" generics="T extends { id: number }">
	let { items, pick }: { items: T[]; pick?: (t: T) => void } = $props();
	let current = $state<T | null>(null);

	function choose<U extends T>(item: U): void {
		current = item;
		pick?.(item);
	}
</script>

{#each items as item (item.id)}
	<button onclick={() => choose(item)}>{item.id}</button>
{/each}
<p>{current?.id ?? '-'}</p>
