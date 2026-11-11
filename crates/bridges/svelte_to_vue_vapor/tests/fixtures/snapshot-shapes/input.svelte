<script>
  let count = $state(0);
  let value = $state({ map: new Map([['key', 1]]), date: new Date('2020-01-01T00:00:00Z'), items: Array(3) });
  let saved = $state.raw($state.snapshot(value));
  function change() {
    value.map.set('key', value.map.get('key') + 1);
    value.date.setUTCFullYear(value.date.getUTCFullYear() + 1);
    value.items[1] = count;
    count++;
  }
</script>
<button onclick={change}>change</button>
<button onclick={() => saved = $state.snapshot(value)}>snapshot</button>
<p>{count}:{value.map.get('key')}:{value.date.getUTCFullYear()}:{JSON.stringify(value.items)}</p>
<output>{saved.map.get('key')}:{saved.date.getUTCFullYear()}:{saved.items.length}:{0 in saved.items}:{JSON.stringify(saved.items)}</output>
