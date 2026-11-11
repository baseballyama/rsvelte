<script lang="ts" generics="T">
  const { a }: { a: T[] } | { a: T[] } = $props();
</script>
{a}