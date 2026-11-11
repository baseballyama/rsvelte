<script>
	let items = [1];
</script>

{#each items as item}{'in-each'}{/each}
{#if items.length}{'in-if'}{/if}
{#snippet s()}{'in-snippet'}{/snippet}
{@render s()}
{@html '<b>raw</b>'}
{@html `tpl`}
<svelte:element this="div" title={'x'}>1</svelte:element>
