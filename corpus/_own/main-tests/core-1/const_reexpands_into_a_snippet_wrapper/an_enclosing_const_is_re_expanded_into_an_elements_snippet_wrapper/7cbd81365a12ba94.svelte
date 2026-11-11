<script>
	let { v } = $props();
</script>
{#if v}{@const h = v}<div>{const g = h}{#snippet s()}{h}{g}{/snippet}{@render s()}</div>{/if}
