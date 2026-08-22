<script>
	export let name = 'n';
	const has = $$slots;
</script>

<slot />
<slot name="side" item={name} />
{#if $$slots.side}
	<slot name="side" />
{/if}
<slot name="fallback">default <b>{name}</b></slot>
<p>{JSON.stringify(has)}</p>
