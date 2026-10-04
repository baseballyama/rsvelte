<script>
  function counter(initial) {
    let value = $state(initial);
    let raw = $state.raw({ step: 1 });
    let double = $derived(value * 2);
    let [offset, ...rest] = $state([3, 4, 5]);
    let { total } = $derived({ total: value + offset });
    return {
      get value() { return value; },
      get double() { return double; },
      get total() { return total; },
      get rest() { return rest.join(','); },
      increase() { value += raw.step; offset++; raw = { step: 2 }; }
    };
  }
  const first = counter(1);
  const second = counter(10);
</script>
<button id="first" onclick={() => first.increase()}>first</button>
<button id="second" onclick={() => second.increase()}>second</button>
<p>{first.value}:{first.double}:{first.total}:{first.rest}</p>
<p>{second.value}:{second.double}:{second.total}:{second.rest}</p>
