<svelte:options customElement={{ tag: 'vapor-initial-values', props: {
  count: { type: 'Number', reflect: true },
  enabled: { type: 'Boolean', reflect: true },
  object: { type: 'Object', reflect: true },
  name: { type: 'String' }
} }} />
<script>
  let { count = 2, enabled = false, object = { default: true }, name = 'default' } = $props();
  let mounts = $state(0);
  let sampled = $state('');
  import { onMount, onDestroy } from 'svelte';
  onMount(() => mounts++);
  onDestroy(() => $host()?.setAttribute('data-destroyed', 'yes'));
  function sample() {
    const host = $host();
    sampled = JSON.stringify([host.count, typeof host.count, host.enabled, host.object, host.name,
      host.getAttribute('count'), host.getAttribute('enabled'), host.getAttribute('object'), host.getAttribute('name'),
      host.getAttribute('data-destroyed')]);
  }
  function move() { const host = $host(); const parent = host.parentNode; host.remove(); parent.appendChild(host); }
  function reconnect() {
    const host = $host(); const parent = host.parentNode;
    host.remove(); setTimeout(() => parent.appendChild(host), 0);
  }
</script>
<button onclick={sample}>sample</button>
<button onclick={() => count++}>increment</button>
<button onclick={move}>move</button>
<button onclick={reconnect}>reconnect</button>
<p>{count}:{String(enabled)}:{name}:{JSON.stringify(object)}:{mounts}</p>
<output>{sampled}</output>
