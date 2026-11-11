<script lang="ts">
  type Row = { id: number; label: string };

  const rows: Row[] = [{ id: 1, label: "a" }];

  const asConst = { mode: "wide" } as const;

  const satisfied = { id: 1, label: "b" } satisfies Row;

  const widened = rows satisfies readonly Row[] as Row[];

  function pick<T extends Row, K extends keyof T>(row: T, key: K): T[K] {
    return row[key];
  }

  const mapped: { [K in keyof Row]: string } = { id: "1", label: "b" };

  const tuple: [number, ...string[]] = [1, "a"];

  const guarded = (value: unknown): value is Row =>
    typeof value === "object" && value !== null;
</script>

<b>{pick(rows[0], "label")}</b>
<b>{asConst.mode}{satisfied.label}{widened.length}</b>
<b>{mapped.id}{tuple.length}</b>
<b>{guarded(rows[0])}</b>
<b>{(rows[0] satisfies Row).id}</b>
