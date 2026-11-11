<script lang="ts">
	let { x = 1 } = $props();
</script>

{#snippet row(v: number)}<i>{v}</i>{/snippet}
{@render row(x)}
