<script>
  import Self from "./unusual-component-names.svelte";

  let { depth = 0 } = $props();

  const A = Self;
  const Dollar$ = Self;
  const A_b$1 = Self;
  const Ünïcode = Self;
  const X1 = Self;
</script>

{#if depth === 0}
  <A depth={1} />
  <Dollar$ depth={1} />
  <A_b$1 depth={1} />
  <Ünïcode depth={1} />
  <X1 depth={1} />
{:else}
  <b>{depth}</b>
{/if}
