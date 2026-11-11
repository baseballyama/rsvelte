<script lang="ts">
  let q: any;
  function f(x: any) { return x; }
  $: w = q as Record<string, any>;
</script>
{w}