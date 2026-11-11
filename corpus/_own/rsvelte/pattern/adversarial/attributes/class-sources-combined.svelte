<script>
  let on = $state(true);
  const spread = { class: "from-spread", id: "spread-id" };
</script>

<div class="static" class:toggled={on} {...spread}>a</div>
<div {...spread} class="static" class:toggled={on}>b</div>
<div class={["array", on && "conditional"]} class:toggled={on}>c</div>
<div {...spread} class={["array"]}>d</div>
<div class="static {on ? 'ternary' : ''}" class:toggled={on} {...spread}>e</div>

<style>
  .static,
  .toggled,
  .array,
  .conditional,
  .ternary,
  .from-spread {
    color: red;
  }
</style>
