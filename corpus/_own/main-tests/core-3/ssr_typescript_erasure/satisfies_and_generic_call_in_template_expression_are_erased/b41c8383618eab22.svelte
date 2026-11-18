<script lang="ts">
	let { items }: { items: string[] } = $props();
	function pick<T>(xs: T[]): T { return xs[0]; }
</script>

<p>{pick<string>(items)}</p>
<p>{({ a: 1 }) satisfies Record<string, number>}</p>
{#each items as item}<span>{item as string}</span>{/each}
