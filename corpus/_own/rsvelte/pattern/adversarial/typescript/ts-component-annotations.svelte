<script lang="ts">
  type Row = { id: number; label?: string };

  interface Props {
    rows?: Row[];
    title?: string;
  }

  let { rows = [], title = "t" }: Props = $props();

  let selected = $state<Row | null>(null);
  const count = $derived<number>(rows.length);

  function pick<T extends Row>(row: T): T {
    selected = row;
    return row;
  }

  const first = rows[0] as Row | undefined;
  const forced = (first satisfies Row | undefined) ?? null;
</script>

<b>{title}{count}{selected?.id ?? -1}{forced?.id ?? -1}{pick({ id: 1 }).id}</b>
