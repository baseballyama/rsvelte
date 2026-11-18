<script>
  import Box from "./children-and-prop-snippets.svelte";

  let { children, header, depth = 0 } = $props();
</script>

{#snippet localHeader(text)}
  <h1>{text}</h1>
{/snippet}

{#if depth === 0}
  <Box depth={1} header={localHeader}>
    <b>slotted</b>
  </Box>
{:else}
  {#if header}
    {@render header("h")}
  {/if}
  {#if children}
    {@render children()}
  {/if}
{/if}
