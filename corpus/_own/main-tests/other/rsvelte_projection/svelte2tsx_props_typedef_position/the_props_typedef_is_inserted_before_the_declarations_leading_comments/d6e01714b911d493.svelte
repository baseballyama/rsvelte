<script lang="ts" generics="T">
  interface Cfg { b?: number }
  const { a }: { a: T[] } & Cfg = $props();
</script>
{a}