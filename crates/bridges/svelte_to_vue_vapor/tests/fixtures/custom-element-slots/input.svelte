<script>
  import { onMount } from 'svelte';
  let named;
  let defaultSlot;
  let span;
  let text;
  let observed = $state('');
  onMount(() => {
    named = $host().shadowRoot.querySelector('slot[name="named"]');
    defaultSlot = $host().shadowRoot.querySelector('slot:not([name])');
    span = $host().querySelector('span[slot="named"]');
    text = Array.from($host().childNodes).find(node => node.nodeType === Node.TEXT_NODE);
    return () => { span.remove(); text.remove(); };
  });
  function sample() {
    observed = JSON.stringify([
      named.assignedNodes().map(node => node.textContent),
      defaultSlot.assignedNodes().map(node => node.textContent)
    ]);
  }
  function toggle() {
    if (span.parentNode) { span.remove(); text.remove(); }
    else { $host().appendChild(span); $host().appendChild(text); }
  }
</script>
<slot name="named"><b>named fallback</b></slot>
<slot><i>default fallback</i></slot>
<button onclick={sample}>sample</button>
<button onclick={toggle}>toggle</button>
<output>{observed}</output>
<svelte:options customElement={{ tag: 'vapor-slot-example', shadow: 'open' }} />
