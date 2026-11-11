<script>
  let values = $state([1, 2]);
  let selected = $state([1]);
  let radio = $state(1);
</script>
{#each values as value}
  <input class="global" type="checkbox" bind:group={selected} value={value} />
  <input class="radio" type="radio" bind:group={radio} value={value} />
  {let local = $state([])}
  <section>
    <input type="checkbox" bind:group={local} value={value} />
    <input type="checkbox" value={value + 10} bind:group={local} />
    <p>{local.join(',')}</p>
  </section>
{/each}
<button onclick={() => { values[0] = 3; selected = [2]; radio = 2; }}>replace</button>
<p>{selected.join(',')}:{typeof selected[0]}:{radio}:{typeof radio}</p>
