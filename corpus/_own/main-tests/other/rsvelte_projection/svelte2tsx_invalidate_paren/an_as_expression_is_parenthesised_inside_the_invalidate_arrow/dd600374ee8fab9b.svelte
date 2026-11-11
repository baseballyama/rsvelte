<script lang="ts">
  let q: any;
  function f(x: any) { return x; }
  $: w = f(q);
</script>
{w}