<script lang="ts" module>
  export type Row = { id: number };

  export interface Options {
    limit: number;
  }

  let shared = $state<number>(0);

  export function bump(step: number = 1): number {
    shared += step;
    return shared;
  }

  const table: Map<string, Row> = new Map();
</script>

<script lang="ts">
  let { rows = [] as Row[], options }: { rows?: Row[]; options?: Options } =
    $props();

  const total = $derived(rows.length + shared + (options?.limit ?? 0));

  function record(row: Row): void {
    table.set(String(row.id), row);
  }
</script>

<b>{total}{table.size}</b>
<button onclick={() => bump(2)}>go</button>
{#each rows as row (row.id)}
  <b onclick={() => record(row)} role="presentation">{row.id}</b>
{/each}
