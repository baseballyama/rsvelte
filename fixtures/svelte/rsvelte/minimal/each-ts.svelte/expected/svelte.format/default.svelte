<script lang="ts">
  let { items }: { items: string[] } = $props();
</script>

{#each items as item (item)}
  <p>{item as string}</p>
{/each}
