<script lang="ts">
	let { a }: { a: number } = $props();
</script>
{#if $$slots.default}<p>{a}</p>{/if}
