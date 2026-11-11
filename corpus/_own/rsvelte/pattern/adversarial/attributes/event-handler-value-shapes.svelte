<script>
  let n = $state(0);

  function named(event) {
    n += 1;
  }

  const stored = named;
  const table = { handler: named };
  const list = [named];
  let toggled = $state(true);
  const onclick = named;
</script>

<button onclick={named}>a</button>
<button onclick={(event) => (n += 1)}>b</button>
<button
  onclick={() => {
    n += 1;
  }}>c</button
>
<button onclick={stored}>d</button>
<button onclick={table.handler}>e</button>
<button onclick={list[0]}>f</button>
<button onclick={toggled ? named : stored}>g</button>
<button onclick={null}>h</button>
<button onclick={undefined}>i</button>
<button {onclick}>j</button>
<button onclick={async (event) => await Promise.resolve((n += 1))}>k</button>
<button onclick={named} onmouseenter={named} onfocus={named}>l</button>
<b>{n}</b>
