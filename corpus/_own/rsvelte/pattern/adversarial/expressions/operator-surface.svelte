<script>
  let box = $state({ a: 1, b: 2 });
  const list = [1, 2, 3];
  const table = { c: 3 };

  function tour() {
    const inTest = "a" in box;
    const instanceTest = list instanceof Array;
    const voided = void 0;
    const deleted = delete box.b;
    const types = [typeof box, typeof list, typeof tour, typeof undefined];
    const spreadCall = Math.max(...list);
    const spreadArray = [...list, ...Object.values(table)];
    const spreadObject = { ...box, ...table };
    const sequence = (box.a, list.length, table.c);
    const negated = !!box.a;
    const bitwise = (5 & 3) | (2 ^ 1);
    const shifted = (1 << 3) >> 1;
    const unsigned = -1 >>> 28;
    const exponent = 2 ** 10;
    const remainder = 7 % 3;
    return [
      inTest,
      instanceTest,
      voided,
      deleted,
      types.join(","),
      spreadCall,
      spreadArray.length,
      Object.keys(spreadObject).length,
      sequence,
      negated,
      bitwise,
      shifted,
      unsigned,
      exponent,
      remainder,
    ];
  }

  function Ctor() {
    return new.target ? 1 : 0;
  }
</script>

<b>{tour().join("|")}</b>
<b>{Ctor()}</b>
<b>{(box.a, box.a + 1)}</b>
<b>{"a" in box}</b>
<b>{[...list].length}</b>
