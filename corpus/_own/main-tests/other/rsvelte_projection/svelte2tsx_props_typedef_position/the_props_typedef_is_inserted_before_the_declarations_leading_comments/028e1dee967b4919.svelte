<script lang="ts">
  interface Cfg { b?: number }
  const { a }: { a: number[] } & Cfg = $props();
</script>
{a}