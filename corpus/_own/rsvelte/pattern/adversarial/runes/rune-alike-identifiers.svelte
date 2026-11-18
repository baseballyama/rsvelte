<script>
  const state = 1;
  const derived = 2;
  const effect = 3;
  const props = 4;
  const bindable = 5;
  const inspect = 6;
  const host = 7;

  const object = { state, derived, effect, props };
  const method = { state: () => state };

  let real = $state(state + derived);
</script>

<b>{state}{derived}{effect}{props}</b>
<b>{bindable}{inspect}{host}</b>
<b>{object.state}{method.state()}{real}</b>
