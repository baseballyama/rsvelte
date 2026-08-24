<script>
  import Self from "./snippet-as-component-prop.svelte";

  let { depth = 0, header, footer, children } = $props();
</script>

{#snippet localHeader(text)}
  <h1>{text}</h1>
{/snippet}

{#if depth === 0}
  <Self depth={1} header={localHeader} footer={localHeader}>
    {#snippet children()}
      <b>c</b>
    {/snippet}
  </Self>
{:else}
  {@render header?.("h")}
  {@render footer?.("f")}
  {@render children?.()}
{/if}
