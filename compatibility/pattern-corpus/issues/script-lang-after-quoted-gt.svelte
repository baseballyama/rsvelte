<script generics="T extends Record<string, unknown>" lang="ts">
	let { items }: { items: T[] } = $props();
</script>

{#each items as item}
	{@const width = (w: number | undefined) => w ?? 0}
	<p>{width(item.size as number)}</p>
{/each}
