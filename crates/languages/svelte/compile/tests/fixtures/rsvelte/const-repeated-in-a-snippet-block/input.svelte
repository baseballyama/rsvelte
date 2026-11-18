<script>
	let { v } = $props();
</script>

{#if v}{@const h = v}<div>{#snippet s()}{h}{/snippet}{@render s()}</div>{/if}
{#if v}{@const k = v}<section><p>{#snippet t()}{k}{/snippet}{@render t()}</p></section>{/if}
