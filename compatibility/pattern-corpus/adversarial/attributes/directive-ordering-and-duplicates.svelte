<script>
  let value = $state("v");
  let on = $state(true);
  let node = $state(null);

  function first(element) {}

  function second(element) {}
</script>

<input bind:value use:first use:second class:active={on} style:color="red" />
<input class:active={on} bind:value style:color="red" use:first />
<input style:color="red" class:active={on} use:first bind:value />
<div
  use:first
  use:second
  class:a={on}
  class:b={!on}
  style:color="red"
  style:background="blue"
>
  a
</div>
<div bind:this={node} class:a={on} use:first>b</div>
<div class:a={on} class:a-b={on} class:aB={on}>c</div>
<input bind:value class="static" />

<style>
  .active {
    color: red;
  }

  .a,
  .b,
  .a-b,
  .aB {
    color: blue;
  }
</style>
