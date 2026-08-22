<script>
  let n = $state(1);
  let rows = $state([1]);
  let promise = $state(Promise.resolve(1));
</script>

{#if n}
  <b>a</b>
  <!-- between if and else -->
{:else if n === 0}
  <b>b</b>
  <!-- between else-if and else -->
{:else}
  <b>c</b>
{/if}

{#each rows as row}
  <b>{row}</b>
  <!-- between each and else -->
{:else}
  <b>none</b>
{/each}

{#await promise}
  <b>p</b>
  <!-- between pending and then -->
{:then value}
  <b>{value}</b>
  <!-- between then and catch -->
{:catch error}
  <b>{error.message}</b>
{/await}
