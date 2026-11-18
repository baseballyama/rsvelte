<script>
	let { v } = $props();
</script>
{#if v}{@const h = v}<div>{#snippet s()}{h}{/snippet}{@render s()}</div>{/if}
