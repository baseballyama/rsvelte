<script>
  let rows = $state([{ id: 1, meta: { tag: "a" }, pair: [1, 2] }]);
</script>

{#each rows as { id }}
  <b>{id}</b>
{/each}

{#each rows as { id, meta: { tag } }}
  <b>{id}{tag}</b>
{/each}

{#each rows as { pair: [first, second] }}
  <b>{first}{second}</b>
{/each}

{#each rows as { id, ...others }}
  <b>{id}{Object.keys(others).length}</b>
{/each}

{#each rows as { missing = "d" }}
  <b>{missing}</b>
{/each}

{#each [[1, 2]] as [left, right]}
  <b>{left}{right}</b>
{/each}

{#each [[1, [2, 3]]] as [head, [nested, ...tail]]}
  <b>{head}{nested}{tail.length}</b>
{/each}
