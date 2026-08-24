<script>
  let rows = $state([{ id: 1, cells: [1, 2] }]);
</script>

{#snippet row(item, index)}
  {@const label = `${index}:${item.id}`}
  {@const [first, second] = item.cells}
  {@const doubled = first * 2}
  <b>{label}</b>
  <b>{first}{second}{doubled}</b>
  {#each item.cells as cell, i}
    {@const inner = `${label}/${cell}/${i}`}
    <b>{inner}</b>
  {/each}
{/snippet}

{#each rows as item, index (item.id)}
  {@render row(item, index)}
{/each}
