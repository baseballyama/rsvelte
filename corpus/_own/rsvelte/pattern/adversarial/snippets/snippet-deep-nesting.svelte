<script>
  let rows = $state([{ id: 1, children: [{ id: 2 }] }]);
</script>

{#snippet level1(row)}
  {#snippet level2(child)}
    {#snippet level3(label)}
      <b>{label}</b>
    {/snippet}
    {@render level3(`${row.id}/${child.id}`)}
  {/snippet}
  {#each row.children as child (child.id)}
    {@render level2(child)}
  {/each}
{/snippet}

{#each rows as row (row.id)}
  {@render level1(row)}
{/each}
