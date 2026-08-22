<script>
  let rows = $state([1, 2]);
</script>

{#each rows as text, index}
  <b>{text}{index}</b>
{/each}

{#each rows as node, anchor}
  <b>{node}{anchor}</b>
{/each}

{#each rows as root}
  <b>{root}</b>
{/each}

{#each rows as fragment, i (i)}
  <b>{fragment}</b>
{/each}
