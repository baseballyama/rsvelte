<script lang="ts">
  interface Row {
    id: number;
    label?: string;
  }

  type Alias = Row | null;

  const rows: Row[] = [{ id: 1 }];
  const maybe: Alias = null;
  const asserted = rows[0]!.id as number;
  const satisfied = { id: 1 } satisfies Row;
  const asConst = { a: 1 } as const;
  const angled = <number>(<unknown>rows[0].id);

  function generic<T extends Row>(input: T): T["id"] {
    return input.id;
  }

  class Typed {
    declare readonly declared: number;
    protected value: number = 1;
    static staticValue: string = "s";

    method(next?: number): number {
      return next ?? this.value;
    }
  }

  const typed = new Typed();
</script>

<b>{rows.length}{String(maybe)}</b>
<b>{asserted}{satisfied.id}{asConst.a}{angled}</b>
<b>{generic(rows[0])}{typed.method()}{Typed.staticValue}</b>
