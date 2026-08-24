<script>
  let a = $state(true);
  let b = $state(false);
  const list = ["l1", "l2"];
</script>

<div class:a class:b class:c={a && !b} class:d={a ? true : false}>1</div>
<div class="base" class:a class:b>2</div>
<div class={list} class:a>3</div>
<div class={{ obj: a }} class:b>4</div>
<div class="x {a ? 'y' : ''}" class:a>5</div>

<style>
  .a,
  .b,
  .c,
  .d,
  .base,
  .l1,
  .l2,
  .obj,
  .x,
  .y {
    color: red;
  }
</style>
