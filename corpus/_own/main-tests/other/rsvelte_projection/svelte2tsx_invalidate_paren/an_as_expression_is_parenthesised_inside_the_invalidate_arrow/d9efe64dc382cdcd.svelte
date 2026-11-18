<script lang="ts">
  let q: any;
  function f(x: any) { return x; }
  $: w = (() => { return 1 })();
</script>
{w}