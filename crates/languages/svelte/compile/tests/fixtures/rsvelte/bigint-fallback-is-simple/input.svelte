<script>
	let { p = 1n } = $props();
</script>

{#snippet s(q = 2n)}{q}{/snippet}
{@render s()}
{p}
