<script>
  const original = { count: 1, nested: { value: 2 }, items: [3, 4] };
  let value = $state(original);
  function change() {
    value.count++;
    value.nested.value++;
    value.items.push(5);
  }
</script>
<button onclick={change}>change</button>
<button onclick={() => value = original}>reset</button>
<button onclick={() => value.items.length = 1}>truncate</button>
<p>{JSON.stringify(original)}</p>
<output>{JSON.stringify(value)}</output>
