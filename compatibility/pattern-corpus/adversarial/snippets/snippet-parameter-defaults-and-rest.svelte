<script>
  let rows = $state([{ id: 1 }]);
</script>

{#snippet noParams()}
  <b>none</b>
{/snippet}

{#snippet oneParam(value)}
  <b>{value}</b>
{/snippet}

{#snippet withDefault(value = 1, label = `d${value}`)}
  <b>{value}{label}</b>
{/snippet}

{#snippet destructured({ id }, [head] = [0])}
  <b>{id}{head}</b>
{/snippet}

{#snippet shadowing(rows)}
  <b>{rows}</b>
{/snippet}

{@render noParams()}
{@render oneParam(1)}
{@render withDefault()}
{@render withDefault(2)}
{@render withDefault(2, "x")}
{@render destructured(rows[0])}
{@render destructured(rows[0], [9])}
{@render shadowing("shadowed")}
