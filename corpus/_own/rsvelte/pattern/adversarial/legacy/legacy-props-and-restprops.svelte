<svelte:options runes={false} />

<script>
  export let a = 1;
  export let b = 2;
  export { b as renamed };

  let internal = 3;
  export { internal as exposed };

  $: total = a + b;
</script>

<div {...$$restProps} data-a={$$props.a}>
  <b>{total}{a}{b}{internal}</b>
  {#if $$slots.default}
    <slot />
  {/if}
</div>
