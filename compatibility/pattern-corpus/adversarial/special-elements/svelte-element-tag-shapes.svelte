<script>
  let tag = $state("div");
  const table = { key: "span" };
  const list = ["p", "em"];
</script>

<svelte:element this="b">static</svelte:element>
<svelte:element this={tag}>dynamic</svelte:element>
<svelte:element this={table.key}>member</svelte:element>
<svelte:element this={list[0]}>indexed</svelte:element>
<svelte:element this={tag === "div" ? "section" : "article"}
  >ternary</svelte:element
>
<svelte:element this={"h" + 1}>concatenated</svelte:element>
<svelte:element this={null}>nullish</svelte:element>
<svelte:element
  this={tag}
  class="c"
  style:color="red"
  onclick={() => (tag = "p")}
>
  directives
</svelte:element>
