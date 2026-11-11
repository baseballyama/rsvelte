<script lang="ts" generics="T">
  interface Cfg { b?: number }
  /* C */
  const { a }: { a: T[] } & Cfg = $props();
</script>
{a}