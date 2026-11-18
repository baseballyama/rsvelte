<script>
	let { v } = $props();
</script>
{#if v}{@const h = v}<div>{const g = h}{h}{g}</div>{/if}
