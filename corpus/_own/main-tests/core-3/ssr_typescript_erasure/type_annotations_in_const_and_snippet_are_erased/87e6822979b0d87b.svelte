<script lang="ts">
	let { n }: { n: number } = $props();
</script>

{#snippet row(label: string, value: number)}
	<td>{label}</td><td>{value}</td>
{/snippet}

{#if n}
	{@const doubled: number = n * 2}
	<table><tbody><tr>{@render row('n', doubled)}</tr></tbody></table>
{/if}
