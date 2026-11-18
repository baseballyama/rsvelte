<script>
  let rows = $state([{ id: 1, children: [{ id: 2 }] }]);
  let maybe = $state(null);
</script>

{#each rows as row (row.id)}
  {#snippet perItem(prefix)}
    <b>{prefix}{row.id}</b>
  {/snippet}

  {@render perItem("a")}
  {@render perItem("b")}

  {#each row.children as child (child.id)}
    {#snippet perChild()}
      <b>{row.id}-{child.id}</b>
    {/snippet}

    {@render perChild()}
  {/each}
{/each}

{@render maybe?.()}
{@render (maybe ?? fallback)()}

{#snippet fallback()}
  <b>fallback</b>
{/snippet}
