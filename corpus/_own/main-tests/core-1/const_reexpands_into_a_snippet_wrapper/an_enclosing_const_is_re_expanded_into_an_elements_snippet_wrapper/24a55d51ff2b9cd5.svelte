<script>
	let { v } = $props();
</script>
{#if v}{@const h = v}<svelte:element this={'div'}>{#snippet s()}{h}{/snippet}{@render s()}</svelte:element>{/if}
