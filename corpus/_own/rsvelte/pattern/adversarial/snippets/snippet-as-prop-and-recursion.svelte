<script>
  import Self from "./snippet-as-prop-and-recursion.svelte";

  let { depth = 0, header, footer, children } = $props();
</script>

{#snippet localHeader(text)}
  <b>{text}</b>
{/snippet}

{#snippet tree(depthLeft)}
  {#if depthLeft > 0}
    <ul>
      <li>
        {@render tree(depthLeft - 1)}
      </li>
    </ul>
  {:else}
    <b>leaf</b>
  {/if}
{/snippet}

{#if depth === 0}
  <Self depth={1} header={localHeader} footer={localHeader}>
    {#snippet children()}
      <i>c</i>
    {/snippet}
  </Self>
  {@render tree(3)}
{:else}
  {@render header?.("h")}
  {@render children?.()}
  {@render footer?.("f")}
{/if}
