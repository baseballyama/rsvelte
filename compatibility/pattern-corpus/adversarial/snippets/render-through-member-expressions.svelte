<script>
  let { depth = 0 } = $props();
</script>

{#snippet leaf(label)}
  <b>{label}</b>
{/snippet}

{#snippet other(label)}
  <i>{label}</i>
{/snippet}

{@render leaf("a")}
{@render (depth === 0 ? leaf : other)("b")}
{@render [leaf, other][depth === 0 ? 0 : 1]("c")}
{@render { leaf, other }.leaf("d")}
{@render { leaf, other }["other"]("e")}
{@render (leaf ?? other)("f")}
