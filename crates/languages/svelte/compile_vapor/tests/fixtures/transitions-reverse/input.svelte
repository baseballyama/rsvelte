<script>
  let visible = $state(false);
  let events = $state([]);
  let mounts = 0;
  function mark(element) { element.setAttribute('data-mount', ++mounts); }
  function fade(element) {
    return { duration: 1000, css: (t) => `opacity: ${t}` };
  }
</script>
<button onclick={() => visible = !visible}>toggle</button>
<output>{events.join(',')}</output>
{#if visible}
  <p use:mark transition:fade onintrostart={() => events.push('introstart')} onintroend={() => events.push('introend')} onoutrostart={() => events.push('outrostart')} onoutroend={() => events.push('outroend')}>reverse</p>
{/if}
