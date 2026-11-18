<script lang="ts">
	let io = $state({ a: 1, s: null });
</script>
{#snippet outer()}{io!.a}{/snippet}
{@render outer()}
