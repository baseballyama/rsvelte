<script>
  let active = $state(false);
  let count = $state(0);
  let theme = $state("light");
  const flag = true;

  function even(n) {
    return n % 2 === 0;
  }
</script>

<div class:active>shorthand</div>
<div class="panel" class:active class:is-large={count > 3}>with class</div>
<div class={theme} class:active={!active}>with expression</div>
<div class:even={even(count)} class:odd={!even(count)}>calls</div>
<div class:fixed={flag}>static</div>
<div class="a {theme}" class:b={active}>interpolated</div>
<button onclick={() => count++}>{count}</button>
<button onclick={() => (active = !active)}>toggle</button>
