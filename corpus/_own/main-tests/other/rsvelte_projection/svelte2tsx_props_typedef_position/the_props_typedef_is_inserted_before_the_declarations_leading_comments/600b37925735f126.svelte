<script lang="ts" generics="T">
  // one
  // two
  const { a }: { a: T[] } | { a: T[] } = $props();
</script>
{a}