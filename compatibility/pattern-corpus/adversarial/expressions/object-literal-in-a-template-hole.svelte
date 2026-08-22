<script>
  let n = $state(1);

  function take(value) {
    return Object.keys(value).length;
  }
</script>

<b>{take({ a: 1 })}</b>
<b>{take({ a: { b: { c: 1 } } })}</b>
<b>{JSON.stringify({ a: n })}</b>
<b>{[{ a: 1 }, { b: 2 }].length}</b>
<b>{(() => ({ a: 1 }))().a}</b>
<b>{((value) => ({ ...value, b: 2 }))({ a: 1 }).b}</b>
<b>{n > 0 ? { a: 1 }.a : { b: 2 }.b}</b>
<b>{take(Object.fromEntries([["a", 1]]))}</b>
<b>{`${JSON.stringify({ a: "}" })}`}</b>
<b>{"}"}{"{"}</b>
<div data-json={JSON.stringify({ a: 1 })}>a</div>
