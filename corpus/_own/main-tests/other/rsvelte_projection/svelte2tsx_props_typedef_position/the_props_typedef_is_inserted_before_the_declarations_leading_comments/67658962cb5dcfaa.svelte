<script lang="ts" generics="T">
  interface Cfg { b?: number }
  // one
  // two
  const { a }: { a: T[] } & Cfg = $props();
</script>
{a}