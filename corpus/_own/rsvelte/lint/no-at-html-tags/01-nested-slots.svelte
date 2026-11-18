<script>
	let html = '<b>x</b>';
	let items = [1, 2];
</script>

{@html html}
{#each items as item (item)}
	{@html `<i>${item}</i>`}
{/each}
{#snippet chunk(h)}
	{@html h}
{/snippet}
{@render chunk(html)}
{#if html}
	<!-- comment before -->{@html html}
{/if}
