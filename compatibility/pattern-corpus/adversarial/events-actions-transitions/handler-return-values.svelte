<script>
  let n = $state(0);

  function returnsValue() {
    n += 1;
    return false;
  }

  async function asyncHandler() {
    n += 1;
    await Promise.resolve();
    return n;
  }

  const generatorLike = function* () {
    yield 1;
  };
</script>

<button onclick={returnsValue}>a</button>
<button onclick={asyncHandler}>b</button>
<button onclick={() => returnsValue()}>c</button>
<button onclick={async () => await asyncHandler()}>d</button>
<button onclick={() => void generatorLike()}>e</button>
<form onsubmit={(event) => event.preventDefault()}>
  <button type="submit">f</button>
</form>
<b>{n}</b>
