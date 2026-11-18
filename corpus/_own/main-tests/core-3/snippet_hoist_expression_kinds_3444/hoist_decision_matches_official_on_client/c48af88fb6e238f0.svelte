<script lang="ts">
	let io = $state({ a: 1, s: null });
</script>
{#snippet outer()}{(io as any)?.a}{/snippet}
{@render outer()}
