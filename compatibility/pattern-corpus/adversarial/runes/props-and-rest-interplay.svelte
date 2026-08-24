<script>
  import Self from "./props-and-rest-interplay.svelte";

  let { depth = 0, known = 1, ...rest } = $props();

  const forwarded = $derived({ ...rest, known });
</script>

{#if depth === 0}
  <Self depth={1} known={2} extra="e" data-x={3} {...{ spread: 4 }} />
{:else}
  <div {...rest}>
    <b>{known}{Object.keys(rest).length}{Object.keys(forwarded).length}</b>
  </div>
{/if}
