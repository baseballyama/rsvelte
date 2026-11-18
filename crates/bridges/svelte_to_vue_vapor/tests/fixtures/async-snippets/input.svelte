<script>
  let value = $state(1);
  let enabled = $state(true);
</script>
{#snippet row(item, other = 0)}
  <p>{item}:{other}</p>
  <span>{await Promise.resolve(item * 2)}</span>
{/snippet}
<button id="change" onclick={() => value++}>change</button>
<button id="toggle" onclick={() => enabled = !enabled}>toggle</button>
{@render row(await Promise.resolve(value), await Promise.resolve(value + 1))}
{@render (enabled ? row : undefined)?.(await Promise.resolve(value + 2))}
