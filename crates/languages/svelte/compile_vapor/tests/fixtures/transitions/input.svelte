<script>
  let visible = $state(false);
  let events = $state([]);
  function fade(element, { duration }, { direction }) {
    element.setAttribute('data-direction', direction);
    return {
      duration,
      css: (t) => `opacity: ${t}`,
      tick(t) { element.setAttribute('data-progress', t === 0 ? '0' : t === 1 ? '1' : 'moving'); }
    };
  }
</script>
<button onclick={() => visible = !visible}>toggle</button>
<output>{events.join(',')}</output>
{#if visible}
  <p transition:fade={{ duration: 800 }} onintrostart={() => events.push('introstart')} onintroend={() => events.push('introend')} onoutrostart={() => events.push('outrostart')} onoutroend={() => events.push('outroend')}>transition</p>
  <span>kept until outro ends</span>
{/if}
