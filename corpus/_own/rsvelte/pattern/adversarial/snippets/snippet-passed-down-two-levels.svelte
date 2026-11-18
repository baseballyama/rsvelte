<script>
  import Self from "./snippet-passed-down-two-levels.svelte";

  let { depth = 0, header, body } = $props();
</script>

{#snippet localHeader(label)}
  <b>h:{label}</b>
{/snippet}

{#snippet localBody(label)}
  <i>b:{label}</i>
{/snippet}

{#if depth === 0}
  <Self depth={1} header={localHeader} body={localBody} />
{:else if depth === 1}
  <Self depth={2} {header} {body} />
{:else}
  {@render header?.("deep")}
  {@render body?.("deep")}
{/if}
