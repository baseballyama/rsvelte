<script lang="ts">
  interface Cfg { b?: number }
  // C

  const { a }: { a: number[] } & Cfg = $props();
</script>
{a}