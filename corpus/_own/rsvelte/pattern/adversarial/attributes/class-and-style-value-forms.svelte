<script>
  let on = $state(true);
  const list = ["a", "b"];
  const map = { c: true, d: false };
</script>

<div class="static">1</div>
<div class={list}>2</div>
<div class={map}>3</div>
<div class={["e", { f: on }]}>4</div>
<div class="g {on ? 'h' : ''}">5</div>
<div class={undefined}>6</div>
<div class:i={on} class:j>7</div>
<div style="color: red" style:background={on ? "blue" : null}>8</div>
<div style:--custom="1px" style:width={"2px"}>9</div>

<style>
  .static,
  .a,
  .c,
  .e,
  .g,
  .i,
  .j {
    color: red;
  }
</style>
