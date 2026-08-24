<script>
  let rows = $state([{ id: 1, list: [2, 3] }]);
</script>

{#each rows as row (row.id)}
  {@const first = row.list[0]}
  {@const second = row.list[1]}
  {@const sum = first + second}
  {@const label = `${row.id}:${sum}`}
  {@const [head, ...tail] = row.list}
  {@const { length } = tail}
  {@const doubled = row.list.map((value) => value * sum)}
  <b>{first}{second}{sum}{label}{head}{length}{doubled.join(",")}</b>
{/each}

{#if rows.length}
  {@const outer = rows.length}
  {#if outer}
    {@const inner = outer + 1}
    {#if inner}
      {@const deepest = inner + outer}
      <b>{deepest}</b>
    {/if}
  {/if}
{/if}
