<script>
	export let a = 1;
</script>

<b>{a}{$$props.b}{$$restProps.c}</b>
{#if $$slots.x}<slot name="x" />{/if}
