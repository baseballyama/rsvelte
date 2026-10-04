<script module>
  if (typeof window !== 'undefined' && !customElements.get('vapor-spread-property')) {
    class SpreadProperty extends HTMLElement {
      set data(value) { this._data = value; this.setAttribute('data-object', JSON.stringify(value)); }
      get data() { return this._data; }
      set label(value) {
        this.setAttribute('data-label', String(value));
        this.setAttribute('data-label-calls', Number(this.getAttribute('data-label-calls') ?? 0) + 1);
      }
      set value(value) { this.setAttribute('data-value', String(value)); }
      set active(value) { this.setAttribute('data-active', String(value)); }
      set callback(value) { this.setAttribute('data-callback', typeof value); }
      set camelCase(value) { this.setAttribute('data-camel', String(value)); }
    }
    customElements.define('vapor-spread-property', SpreadProperty);
  }
</script>
<script>
  let mode = $state(0);
  let clicks = $state(0);
  let sampled = $state('');
  const callback = () => clicks++;
  let attributes = $derived(mode === 0 ? {
    data: { count: 1 }, value: 'one', label: 'spread', active: false, disabled: false, bare: true,
    callback, camelCase: 1, onclick: callback
  } : mode === 1 ? {
    data: { count: 2 }, value: 'two', label: 'next', active: true, disabled: true, bare: true,
    callback, camelCase: 2, onclick: callback
  } : mode === 2 ? {
    data: null, value: null, label: null, active: null, disabled: null, bare: false,
    callback: null, camelCase: null, onclick: null
  } : {});
  function sample() {
    sampled = JSON.stringify(Array.from(document.querySelectorAll('[data-case]'), element => [
      element.data?.count ?? null, element.getAttribute('data-object'),
      element.getAttribute('data-label'), element.getAttribute('data-label-calls'),
      element.getAttribute('data-active'), element.getAttribute('data-callback'),
      element.getAttribute('active'), element.getAttribute('disabled'),
      element.getAttribute('bare'), element.getAttribute('camelcase'),
      element.getAttribute('data-camel'), element.getAttribute('data-value'),
      typeof element.__value
    ]));
  }
</script>
<button onclick={() => mode = (mode + 1) % 4}>change</button>
<button onclick={sample}>sample</button>
<vapor-spread-property data-case label="first" {...attributes}>before</vapor-spread-property>
<vapor-spread-property data-case {...attributes} label="last">after</vapor-spread-property>
<unregistered-vapor-spread data-case {...attributes}>unregistered</unregistered-vapor-spread>
<output>{clicks}:{sampled}</output>
