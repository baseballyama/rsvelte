<script>
  let rows = $state([1, 2, 3]);
  let n = $state(3);
</script>

{#each rows}
  <b>x</b>
{/each}

{#each rows, i}
  <b>{i}</b>
{/each}

{#each { length: n }}
  <b>y</b>
{/each}

{#each rows}
  <b>z</b>
{:else}
  <b>empty</b>
{/each}
