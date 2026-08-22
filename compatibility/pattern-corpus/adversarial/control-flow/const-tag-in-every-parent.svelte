<script>
  let rows = $state([{ id: 1 }]);
  let promise = $state(Promise.resolve(1));
</script>

{#if rows.length}
  {@const inIf = rows.length}
  <b>{inIf}</b>
{:else}
  {@const inElse = 0}
  <b>{inElse}</b>
{/if}

{#each rows as row}
  {@const inEach = row.id}
  <b>{inEach}</b>
{:else}
  {@const inEachElse = 0}
  <b>{inEachElse}</b>
{/each}

{#key rows}
  {@const inKey = rows.length}
  <b>{inKey}</b>
{/key}

{#await promise then value}
  {@const inThen = value}
  <b>{inThen}</b>
{:catch error}
  {@const inCatch = error}
  <b>{String(inCatch)}</b>
{/await}

{#snippet body()}
  {@const inSnippet = 1}
  <b>{inSnippet}</b>
{/snippet}

{@render body()}
