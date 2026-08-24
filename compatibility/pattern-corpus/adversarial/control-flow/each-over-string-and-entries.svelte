<script>
  const map = new Map([["a", 1]]);
  const text = "ab";
  let rows = $state([1, 2]);
</script>

{#each text as character}
  <b>{character}</b>
{/each}

{#each text as character, i (i)}
  <b>{i}{character}</b>
{/each}

{#each map.entries() as [key, value], i}
  <b>{i}{key}{value}</b>
{/each}

{#each map.keys() as key}
  <b>{key}</b>
{/each}

{#each map.values() as value}
  <b>{value}</b>
{/each}

{#each Array.from({ length: 3 }, (_, i) => i) as value}
  <b>{value}</b>
{/each}

{#each rows.entries() as [i, value] (i)}
  <b>{i}{value}</b>
{/each}
