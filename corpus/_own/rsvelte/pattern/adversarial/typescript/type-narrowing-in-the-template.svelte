<script lang="ts">
  type Row = { kind: "a"; a: number } | { kind: "b"; b: string };

  let rows = $state<Row[]>([{ kind: "a", a: 1 }]);

  let maybe = $state<string | null>(null);

  function isA(row: Row): row is Extract<Row, { kind: "a" }> {
    return row.kind === "a";
  }
</script>

{#each rows as row (row.kind)}
  {#if row.kind === "a"}
    <b>{row.a}</b>
  {:else}
    <b>{row.b}</b>
  {/if}

  {#if isA(row)}
    <b>{row.a}</b>
  {/if}
{/each}

{#if maybe}
  <b>{maybe.toUpperCase()}</b>
{/if}

<b>{maybe?.length ?? 0}</b>
<b>{(rows[0] as Extract<Row, { kind: "a" }>).a}</b>
