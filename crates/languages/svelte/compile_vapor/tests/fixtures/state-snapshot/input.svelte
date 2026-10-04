<script>
  let value = $state({ count: 1, nested: ['first'] });
  let saved = $state.raw($state.snapshot(value));
</script>

<button class="change" onclick={() => { value.count++; value.nested.push('next'); }}>change</button>
<button class="snapshot" onclick={() => (saved = $state.snapshot(value))}>snapshot</button>
<p>{JSON.stringify(value)}</p>
<output>{JSON.stringify(saved)}</output>
