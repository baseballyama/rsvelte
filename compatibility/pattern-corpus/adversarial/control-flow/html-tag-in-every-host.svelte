<script>
  let markup = $state("<b>a</b>");
  let rows = $state([1]);
  const pending = Promise.resolve("<i>b</i>");
  const table = { key: "<u>c</u>" };
</script>

{@html markup}
{@html `<span>${markup}</span>`}
{@html table.key}
{@html markup + "<hr />"}
{@html rows.length ? markup : ""}

<div>text before {@html markup} text after</div>

{#if rows.length}
  {@html markup}
{/if}

{#each rows as row}
  {@html `<b>${row}</b>`}
{/each}

{#await pending then value}
  {@html value}
{/await}

{#key markup}
  {@html markup}
{/key}

{#snippet inner(value)}
  {@html value}
{/snippet}

{@render inner(markup)}
