<script>
  let seed = $state(1);

  const one = $derived.by(() => {
    const a = seed + 1;
    const b = a * 2;

    if (b > 10) {
      return b;
    }

    return a;
  });

  const two = $derived.by(() =>
    [1, 2, 3]
      .map((value) => value * seed)
      .filter((value) => value > 1)
      .reduce((total, value) => total + value, 0),
  );

  const three = $derived(
    (() => {
      const local = seed * 3;
      return local;
    })(),
  );

  const four = $derived(
    seed > 0
      ? (() => {
          const local = seed;
          return local;
        })()
      : 0,
  );
</script>

<b>{one}{two}{three}{four}</b>
<button onclick={() => (seed += 1)}>{seed}</button>
