<script>
	let { v } = $props();
</script>
{#if v}<div>{#snippet s()}{v}{/snippet}{@render s()}</div>{/if}
