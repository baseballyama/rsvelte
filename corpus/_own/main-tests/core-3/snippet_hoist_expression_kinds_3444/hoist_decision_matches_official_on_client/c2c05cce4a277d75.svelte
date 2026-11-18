<script module lang="ts">
	const mo = { a: 1, s: null };
</script>
{#snippet outer()}{(mo as any)?.a}{/snippet}
{@render outer()}
