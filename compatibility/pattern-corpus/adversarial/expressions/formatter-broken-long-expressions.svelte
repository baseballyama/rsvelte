<script>
  let alpha = $state(1);
  let beta = $state(2);
  let gamma = $state(3);

  const longSum = $derived(
    alpha * 100 +
      beta * 200 +
      gamma * 300 +
      alpha * 400 +
      beta * 500 +
      gamma * 600,
  );

  const longTernary = $derived(
    alpha > 10
      ? beta > 20
        ? "alpha-and-beta-are-both-large"
        : "only-alpha-is-large-here-ok"
      : gamma > 30
        ? "only-gamma-is-large-here-ok"
        : "nothing-is-large-in-this-case",
  );

  const longCall = $derived(
    [alpha, beta, gamma]
      .map((value) => value * 2)
      .filter((value) => value > 2)
      .reduce((total, value) => total + value, 0),
  );

  function longSetter(next) {
    alpha =
      next + beta * 2 + gamma * 3 + alpha * 4 + beta * 5 + gamma * 6 + next * 7;
  }
</script>

<b>{longSum}{longTernary}{longCall}</b>
<b
  >{alpha * 100 +
    beta * 200 +
    gamma * 300 +
    alpha * 400 +
    beta * 500 +
    gamma * 600}</b
>
<button
  onclick={() => longSetter(alpha + beta + gamma + alpha + beta + gamma + 1)}
>
  {alpha}
</button>
