<script>
  let on = $state(true);
  const table = { dynamic: true };
</script>

<div
  class="alpha beta gamma"
  class:delta={on}
  class:epsilon={!on}
  class:zeta={table.dynamic}
>
  a
</div>
<div class="alpha {on ? 'eta' : 'theta'} iota">b</div>
<div class={["alpha", on && "kappa", table]}>c</div>
<div class:lambda={on} class:mu={on}>d</div>

<style>
  .alpha {
    color: red;
  }

  .beta,
  .gamma {
    color: blue;
  }

  .delta,
  .epsilon,
  .zeta {
    color: green;
  }

  .eta,
  .theta,
  .iota {
    color: teal;
  }

  .kappa {
    color: olive;
  }

  .lambda.mu {
    color: navy;
  }

  .alpha.delta:hover {
    color: maroon;
  }

  .never {
    color: gray;
  }
</style>
