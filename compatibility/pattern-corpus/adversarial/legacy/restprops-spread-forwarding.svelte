<script>
	export let tag = 'div';
	export let known = 1;
</script>

<svelte:element this={tag} {...$$restProps} data-known={known}>
	<slot {...$$restProps} name="inner" />
</svelte:element>

<div {...$$props}>{Object.keys($$props).length} {Object.keys($$restProps).length}</div>

{#if $$slots.footer}
	<footer><slot name="footer" /></footer>
{/if}
