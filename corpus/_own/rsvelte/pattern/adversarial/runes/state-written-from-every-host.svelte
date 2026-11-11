<script>
  let fromHandler = $state(0);
  let fromEffect = $state(0);
  let fromClosure = $state(0);
  let fromLoop = $state(0);
  let fromTry = $state(0);

  const bump = () => {
    fromClosure += 1;
  };

  $effect(() => {
    fromEffect += 0;
  });

  for (const n of [1, 2]) fromLoop += n;

  try {
    fromTry += 1;
  } catch {
    fromTry = -1;
  }

  bump();
</script>

<button onclick={() => (fromHandler += 1)}>x</button>
<b>{fromHandler}{fromEffect}{fromClosure}{fromLoop}{fromTry}</b>
