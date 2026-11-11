<script>
  let rows = $state([{ id: 1, nested: [2] }]);
  let flag = $state(true);
  const pending = Promise.resolve(3);
</script>

{#if flag}
  {@const fromIf = rows.length}
  <b>{fromIf}</b>
{:else if rows.length}
  {@const fromElseIf = rows.length + 1}
  <b>{fromElseIf}</b>
{:else}
  {@const fromElse = 0}
  <b>{fromElse}</b>
{/if}

{#each rows as row}
  {@const fromEach = row.id * 2}
  {@const [first] = row.nested}
  <b>{fromEach}{first}</b>
{/each}

{#await pending}
  <b>waiting</b>
{:then value}
  {@const fromThen = value + 1}
  <b>{fromThen}</b>
{:catch error}
  {@const fromCatch = String(error)}
  <b>{fromCatch}</b>
{/await}

{#snippet body(input)}
  {@const fromSnippet = input * 3}
  <b>{fromSnippet}</b>
{/snippet}

{@render body(2)}

<svelte:boundary>
  {@const fromBoundary = rows.length}
  <b>{fromBoundary}</b>
</svelte:boundary>

{#key flag}
  {#if flag}
    {@const fromKeyedIf = 1}
    <b>{fromKeyedIf}</b>
  {/if}
{/key}
