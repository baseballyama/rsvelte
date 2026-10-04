<script>
  let visible = $state(false);
  let events = $state([]);
  function enter(element, parameter, options) {
    element.setAttribute('data-in', options.direction);
    return { duration: 800, css: (t) => `transform: translateX(${100 * (1 - t)}px)` };
  }
  function leave(element, parameter, options) {
    element.setAttribute('data-out', options.direction);
    return { duration: 1000, css: (t) => `opacity: ${t}` };
  }
</script>
<button onclick={() => visible = !visible}>toggle</button>
<output>{events.join(',')}</output>
{#if visible}
  <p in:enter out:leave onintrostart={() => events.push('introstart')} onintroend={() => events.push('introend')} onoutrostart={() => events.push('outrostart')} onoutroend={() => events.push('outroend')}>separate</p>
  <span>group</span>
{/if}
