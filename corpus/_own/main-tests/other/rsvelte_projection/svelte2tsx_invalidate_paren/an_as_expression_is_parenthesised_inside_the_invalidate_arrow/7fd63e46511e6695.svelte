<script lang="ts">
  let q: any;
  function f(x: any) { return x; }
  $: w = q ? 1 : 2;
</script>
{w}