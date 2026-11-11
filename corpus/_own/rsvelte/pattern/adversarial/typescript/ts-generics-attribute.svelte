<script lang="ts" generics="T extends { id: number }, U = string">
  let {
    rows,
    label,
    render,
  }: {
    rows: T[];
    label: U;
    render: (row: T) => string;
  } = $props();

  const ids = $derived(rows.map((row) => row.id));
</script>

{#each rows as row (row.id)}
  <b>{render(row)}</b>
{/each}
<b>{String(label)}{ids.length}</b>
