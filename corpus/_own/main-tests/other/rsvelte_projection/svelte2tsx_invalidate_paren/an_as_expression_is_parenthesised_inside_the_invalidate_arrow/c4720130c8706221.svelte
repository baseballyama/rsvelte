<script lang="ts">
  let q: any;
  function f(x: any) { return x; }
  $: w = { a: 1 }.a ? 1 : 2;
</script>
{w}