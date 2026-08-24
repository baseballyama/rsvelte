<script>
  let a = $state(1);
  let b = $state(2);
  let c = $state(3);
</script>

<div
  class={a > 0
    ? b > 0
      ? c > 0
        ? "abc"
        : "ab"
      : c > 0
        ? "ac"
        : "a"
    : b > 0
      ? "b"
      : "none"}
>
  x
</div>

<b>{a > 0 ? (b > 0 ? (c > 0 ? 1 : 2) : 3) : 4}</b>
<div title={a ? (b ? "x" : "y") : c ? "z" : "w"}>y</div>

<style>
  .abc,
  .ab,
  .ac,
  .a,
  .b,
  .none {
    color: red;
  }
</style>
