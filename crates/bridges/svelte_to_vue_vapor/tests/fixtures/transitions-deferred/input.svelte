<script>
  let visible = $state(false);
  let events = $state([]);
  function deferred(element, label, options) {
    events.push(`factory:${label}:${options.direction}:${element.isConnected}`);
    return ({ direction }) => {
      events.push(`resolve:${direction}:${element.isConnected}`);
      return { duration: 1000, css: t => `opacity: ${t}` };
    };
  }
</script>
<button onclick={() => visible = !visible}>toggle</button>
<output>{events.join(',')}</output>
{#if visible}
  <p transition:deferred={'pair'} onintrostart={() => events.push('introstart')} onintroend={() => events.push('introend')} onoutrostart={() => events.push('outrostart')} onoutroend={() => events.push('outroend')}>deferred</p>
{/if}
