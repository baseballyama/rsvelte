<script>
  import Child from '../component-child/input.svelte';
  let count = $state(1);
  let total = $state(0);
  let visible = $state(true);
  let label = $state('parent');
  let values = $state([2, 3]);
  function activated(value) { total = value; }
</script>
<Child {count} {label} activate={activated} />
<Child {...{ count: count + 1, label: 'spread' }} />
{#if visible}<Child count={5} label="branch" />{/if}
{#each values as value}<Child count={value} label="row" />{/each}
<button class="increment" onclick={() => { count++; label = 'changed'; values[0]++; }}>increment</button>
<button class="toggle" onclick={() => visible = !visible}>toggle</button>
<p class="total">{total}</p>
