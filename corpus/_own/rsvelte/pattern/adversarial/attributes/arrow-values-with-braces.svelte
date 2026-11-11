<script>
  let n = $state(0);

  function take(fn) {
    return typeof fn;
  }
</script>

<div data-a={take((value = { a: 1 }) => value.a)}>a</div>
<div data-b={take(({ a = 1 } = {}) => a)}>b</div>
<div data-c={take(() => ({ nested: { deep: 1 } }))}>c</div>
<div
  data-d={take((value) => {
    return value;
  })}
>
  d
</div>
<button
  onclick={(event) => {
    if (event) {
      n += 1;
    }
  }}>e</button
>
<button onclick={() => ({ n }) && (n += 1)}>f</button>
<b>{n}</b>
