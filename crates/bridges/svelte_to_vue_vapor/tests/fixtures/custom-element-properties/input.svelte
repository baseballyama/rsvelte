<script module>
  if (typeof window !== 'undefined' && !customElements.get('vapor-property-test')) {
    class PropertyTest extends HTMLElement {
      set data(value) { this.setAttribute('data-object', JSON.stringify(value)); }
      set label(value) {
        this.setAttribute('data-label', value);
        this.setAttribute('data-label-calls', Number(this.getAttribute('data-label-calls') ?? 0) + 1);
      }
      set active(value) { this.setAttribute('data-active', String(value)); }
      get version() { return 1; }
    }
    customElements.define('vapor-property-test', PropertyTest);
  }
</script>
<script>
  let value = $state({ count: 0 });
  let enabled = $state(false);
  let visible = $state(true);
  let clicks = $state(0);
  let node = $state();
  let sampled = $state('none');
</script>
<button onclick={() => { value = { count: value.count + 1 }; enabled = !enabled; }}>change</button>
<button onclick={() => { value = null; enabled = null; }}>clear</button>
<button onclick={() => visible = !visible}>toggle</button>
<button onclick={() => sampled = node.data?.count ?? 'none'}>sample</button>
<unregistered-vapor-property data={value} bind:this={node}></unregistered-vapor-property>
{#if visible}
  <vapor-property-test data={value} label="static" active={enabled} disabled={enabled} bare version={value?.count} title="count {value?.count}" onclick={() => clicks++}>content</vapor-property-test>
{/if}
<p>{clicks}:{sampled}</p>
