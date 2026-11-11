<script>
  let count = $state(0);

  function named(event) {
    count += event ? 1 : 0;
  }

  const handlers = {
    click: () => (count += 1),
  };

  const pick = (key) => handlers[key];
</script>

<button onclick={named}>a</button>
<button onclick={handlers.click}>b</button>
<button onclick={pick("click")}>c</button>
<button onclick={() => named()}>d</button>
<button
  onclick={(event) => {
    named(event);
  }}>e</button
>
<button onclick={count > 0 ? named : undefined}>f</button>
<button onclick={null}>g</button>
<b>{count}</b>
