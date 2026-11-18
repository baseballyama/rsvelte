<script module>
	const mo = { a: 1, s: null };
</script>
<script>
	let n = $state(1);
</script>
{#snippet outer()}{mo?.[n]}{/snippet}
{@render outer()}
