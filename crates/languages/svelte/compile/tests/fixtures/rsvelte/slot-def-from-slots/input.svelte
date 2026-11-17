<script lang="ts">
	let { items }: { items: string[] } = $props();
	const rest = { extra: 1 };
</script>

<slot first={items[0]} label="text" mixed="a {items.length}" />
{#each items as item}
	<slot name="row" {item} {...rest} />
{/each}
<slot name="footer" class={1} />
