<script>
  let outer = $state(false);
  let inner = $state(true);
  let events = $state([]);
  let value = $state('before');
  function fade() { return { duration: 400, css: (t) => `opacity: ${t}` }; }
</script>
<button onclick={() => outer = !outer}>outer</button>
<button onclick={() => inner = !inner}>inner</button>
<button onclick={() => value = value === 'before' ? 'after' : 'before'}>value</button>
<output>{events.join(',')}:{value}</output>
{#if outer}
  <section>
    {#if inner}
      <p transition:fade onintrostart={() => events.push('local-in')} onoutrostart={() => events.push('local-out')}>local:{value}</p>
      <p transition:fade|global onintrostart={() => events.push('global-in')} onoutrostart={() => events.push('global-out')}>global:{value}</p>
    {/if}
  </section>
{/if}
