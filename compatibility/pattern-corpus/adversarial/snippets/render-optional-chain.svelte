<script>
	let { header, row } = $props();
	const rows = [1, 2, 3];
</script>

{#snippet fallback(n)}
	<i>{n}</i>
{/snippet}

{@render header?.()}
{#each rows as n}
	{@render (row ?? fallback)(n)}
{/each}
{@render (header || fallback)?.(0)}
