<script>
  let rows = $state([{ id: 1, children: [{ id: 2 }] }]);
  let promise = $state(Promise.resolve(rows));
</script>

{#if rows.length}
  {#each rows as row (row.id)}
    {#key row.id}
      {#await promise then loaded}
        {#each loaded as inner (inner.id)}
          {#if inner.children.length}
            {#each inner.children as child (child.id)}
              {#key child.id}
                {@const label = `${row.id}/${inner.id}/${child.id}`}
                <b>{label}</b>
              {/key}
            {/each}
          {/if}
        {/each}
      {/await}
    {/key}
  {/each}
{/if}
