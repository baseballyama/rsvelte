<script>
  import Self from "./spread-with-snippet-children.svelte";

  let { depth = 0, label = "l", children, extra } = $props();

  const shared = { label: "spread", extra: 1 };
</script>

{#if depth === 0}
  <Self {...shared} depth={1}>
    {#snippet children()}
      <b>a</b>
    {/snippet}
  </Self>
  <Self depth={1} {...shared}>
    <b>b</b>
  </Self>
  <Self {...shared} label="override" depth={1} />
  <Self label="before" {...shared} depth={1} />
  <Self {...shared} {...{ label: "second" }} depth={1} />
{:else}
  <b>{label}{extra}</b>
  {@render children?.()}
{/if}
