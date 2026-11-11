<script lang="ts">
  interface Cfg { b?: number }
  // one
  // two
  const { a }: { a: number[] } & Cfg = $props();
</script>
{a}