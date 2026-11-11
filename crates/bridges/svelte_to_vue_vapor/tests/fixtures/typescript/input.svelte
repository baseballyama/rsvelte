<script lang="ts">
  let count: number = $state(0);
  const double = (value: number): number => value * 2;
</script>
<button onclick={() => count++}>{double(count)}</button>
