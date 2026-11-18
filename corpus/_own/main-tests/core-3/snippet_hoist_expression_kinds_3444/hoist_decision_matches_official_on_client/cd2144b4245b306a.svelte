<script module>
	const mo = { a: 1, s: null };
</script>
{#snippet outer()}{#if mo?.a}y{/if}{/snippet}
{@render outer()}
