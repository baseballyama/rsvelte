<script lang="ts">
	type Item = { label: string };
	let { name }: { name: string } = $props();
</script>
{#snippet reaches()}{@render blocked()}{/snippet}
{#snippet blocked()}<p>{name}</p>{/snippet}
{#snippet typed(item: Item)}<p>{item.label}</p>{/snippet}
{@render reaches()}
{@render typed({ label: 'a' })}
