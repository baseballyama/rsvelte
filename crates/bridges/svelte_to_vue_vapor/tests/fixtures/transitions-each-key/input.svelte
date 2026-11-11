<script>
  let items = $state([1, 2]);
  let revision = $state(0);
  let events = $state([]);
  function fade() { return { duration: 400, css: (t) => `opacity: ${t}` }; }
</script>
<button onclick={() => items = items.slice(1)}>remove</button>
<button onclick={() => items = [...items, (items.at(-1) ?? 0) + 1]}>add</button>
<button onclick={() => items.reverse()}>reverse</button>
<button onclick={() => revision++}>key</button>
<output>{events.join(',')}</output>
<ul>
  {#each items as item, index (item)}
    <li transition:fade onintrostart={() => events.push('in' + item)} onoutrostart={() => events.push('out' + item)}>{item}:{index}</li>
  {/each}
</ul>
{#key revision}
  <p transition:fade onintrostart={() => events.push('key-in')} onoutrostart={() => events.push('key-out')}>{revision}</p>
  <span>key group</span>
{/key}
