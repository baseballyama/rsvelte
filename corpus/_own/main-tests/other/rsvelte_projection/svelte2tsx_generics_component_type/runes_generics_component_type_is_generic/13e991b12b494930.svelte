<script lang="ts" generics="T extends string">
  let { items }: { items: T[] } = $props();
</script>
{#each items as it}<span>{it}</span>{/each}
