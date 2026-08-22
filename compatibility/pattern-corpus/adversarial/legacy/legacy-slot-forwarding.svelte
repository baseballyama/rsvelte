<svelte:options runes={false} />

<script>
  export let items = [1];
</script>

<div>
  <slot name="header" {items}>fallback header</slot>
  {#each items as item}
    <slot {item} index={item}>fallback {item}</slot>
  {/each}
  {#if $$slots.footer}
    <slot name="footer" />
  {/if}
</div>
