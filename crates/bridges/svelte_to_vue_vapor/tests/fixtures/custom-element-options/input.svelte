<svelte:options customElement={{
  tag: 'vapor-options', shadow: { mode: 'open', delegatesFocus: true, clonable: true },
  props: {
    count: { type: 'Number', reflect: true, attribute: 'step-count' },
    enabled: { reflect: true },
    name: { type: 'String', reflect: true, attribute: 'user-label' },
    items: { type: 'Array', reflect: true },
    payload: { type: 'Object', reflect: true }
  },
  extend: Base => class extends Base {
    constructor() { super(); this.marker = 'extended'; }
    extra() { return this.marker; }
  }
}} />
<script>
  let { count = $bindable(2), enabled = false, label = 'start', camelName: name = 'world', items = ['default'], payload = { first: true } } = $props();
  let sampled = $state('');
  export const fixed = 'exported';
  export function read() { return count; }
  function sample() {
    const host = $host();
    sampled = JSON.stringify([
      host.count, typeof host.count, host.enabled, typeof host.enabled,
      host.label, host.camelName, host.items, host.payload,
      host.getAttribute('step-count'), host.getAttribute('enabled'),
      host.getAttribute('label'), host.getAttribute('user-label'),
      host.getAttribute('items'), host.getAttribute('payload'),
      host.extra(), host.fixed, host.read(), host.shadowRoot.delegatesFocus, host.shadowRoot.clonable
    ]);
  }
  function attributes() {
    const host = $host();
    host.setAttribute('step-count', '7');
    host.setAttribute('enabled', 'false');
    host.setAttribute('user-label', 'attribute');
    host.setAttribute('items', '[1,2]');
    host.setAttribute('payload', '{"next":true}');
  }
  function properties() {
    const host = $host();
    host.count = 11; host.enabled = false; host.label = 'property'; host.camelName = 'property';
    host.items = ['a', 'b']; host.payload = { value: 3 };
  }
  function remove() {
    const host = $host();
    ['step-count', 'enabled', 'user-label', 'items', 'payload'].forEach(name => host.removeAttribute(name));
  }
</script>
<button onclick={sample}>sample</button>
<button onclick={() => count++}>increment</button>
<button onclick={attributes}>attributes</button>
<button onclick={properties}>properties</button>
<button onclick={remove}>remove</button>
<p>{count}:{String(enabled)}:{label}:{name}:{JSON.stringify(items)}:{JSON.stringify(payload)}</p>
<output>{sampled}</output>
