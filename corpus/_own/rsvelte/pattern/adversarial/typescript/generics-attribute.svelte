<script lang="ts" generics="Row extends { id: number }, Key extends keyof Row">
  interface Props {
    rows: Row[];
    key: Key;
    render?: (row: Row) => string;
  }

  let { rows, key, render = (row: Row) => String(row.id) }: Props = $props();

  const ids = $derived(rows.map((row: Row) => row[key]));

  function first<T>(list: T[]): T | undefined {
    return list[0];
  }
</script>

{#each rows as row (row.id)}
  <b>{render(row)}</b>
{/each}

<b>{ids.length}</b>
<b>{String(first(ids))}</b>
