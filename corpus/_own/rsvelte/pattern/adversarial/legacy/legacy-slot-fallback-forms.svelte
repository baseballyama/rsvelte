<svelte:options runes={false} />

<script>
  import Self from "./legacy-slot-fallback-forms.svelte";

  export let depth = 0;
</script>

{#if depth === 0}
  <Self depth={1} />
  <Self depth={1}>
    <b>supplied default</b>
  </Self>
  <Self depth={1}>
    <b slot="named">supplied named</b>
  </Self>
{:else}
  <slot>
    <b>fallback default</b>
  </slot>
  <slot name="named">
    <b>fallback named</b>
  </slot>
  <slot name="never">
    {#if depth}
      <b>fallback with a block</b>
    {/if}
  </slot>
{/if}
