<script>
  let n = $state(1);
  const key = "computed";
  const spreadable = { a: 1 };

  const obj = {
    n,
    "quoted key": 1,
    123: 2,
    [key]: 3,
    [`${key}-2`]: 4,
    get accessor() {
      return n;
    },
    set accessor(next) {
      n = next;
    },
    method() {
      return n;
    },
    *gen() {
      yield n;
    },
    async asyncMethod() {
      return n;
    },
    ...spreadable,
  };

  const arr = [1, , 3, ...[4, 5], ...(n > 0 ? [6] : [])];
</script>

<b>{obj.n}</b>
<b>{obj["quoted key"]}</b>
<b>{obj[123]}</b>
<b>{obj.computed}</b>
<b>{obj.accessor}</b>
<b>{obj.method()}</b>
<b>{arr.length}</b>
