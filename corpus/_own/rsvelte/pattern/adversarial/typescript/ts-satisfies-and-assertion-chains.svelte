<script lang="ts">
  type Row = { id: number; tags?: string[] };

  const rows = [{ id: 1 }] satisfies Row[];
  const first = rows[0]!;
  const tags = first.tags! satisfies string[] | undefined;
  const asAny = first as unknown as { id: string };
  const angled = <Row>{ id: 2 };
  const constAssert = [1, 2] as const;
  const nested = (first as Row satisfies Row).id;
  const optionalCall = first.tags?.map?.((t: string) => t)?.length;

  function narrow(input: Row | null): input is Row {
    return input !== null;
  }
</script>

<b>{rows.length}{first.id}</b>
<b>{String(tags)}{asAny.id}{angled.id}</b>
<b>{constAssert[0]}{nested}{optionalCall ?? 0}</b>
<b>{narrow(first)}</b>
