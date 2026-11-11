<svelte:options runes={false} />

<script>
  export let known = 1;

  $: everything = $$props;
  $: forwarded = $$restProps;
  $: hasDefault = !!$$slots.default;
  $: hasNamed = !!$$slots.named;
</script>

<div {...$$restProps}>
  <b>{known}{Object.keys(everything).length}</b>
  <b>{Object.keys(forwarded).length}</b>
  <b>{hasDefault}{hasNamed}</b>
  <slot />
  <slot name="named" />
</div>
