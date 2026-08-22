<script>
  import Self from "./spread-chain-across-levels.svelte";

  let { depth = 0, ...rest } = $props();

  const seed = { a: 1, b: 2, c: 3 };
</script>

{#if depth === 0}
  <Self depth={1} {...seed} />
{:else if depth === 1}
  <Self depth={2} {...rest} extra={1} />
{:else if depth === 2}
  <Self depth={3} {...rest} {...{ d: 4 }} />
{:else}
  <b>{Object.keys(rest).sort().join(",")}</b>
{/if}
