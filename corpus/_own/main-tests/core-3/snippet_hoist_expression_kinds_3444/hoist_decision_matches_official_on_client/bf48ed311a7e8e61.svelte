<script>
	let n = $state(1);
</script>
{#snippet outer()}{#snippet s(a)}{a}{/snippet}{@render s?.(n)}{/snippet}
{@render outer()}
