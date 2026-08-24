<script>
  let rows = $state([{ id: 1, pair: [1, 2] }]);

  function tour() {
    const out = [];

    for (const {
      id,
      pair: [first, second],
    } of rows) {
      out.push(id + first + second);
    }

    for (const [index, { id }] of rows.entries()) {
      out.push(index + id);
    }

    for (const key in rows[0]) {
      out.push(key);
    }

    try {
      throw { code: "e", detail: { message: "m" } };
    } catch ({ code, detail: { message } }) {
      out.push(code + message);
    }

    const take = ({ id = 0, missing = "d" }, [head = 9] = []) =>
      id + head + missing.length;

    out.push(take(rows[0]));

    let a;
    let b;

    ({
      id: a,
      pair: [b],
    } = rows[0]);
    out.push(a + b);

    [a, b] = [b, a];
    out.push(a + b);

    const [, skipped = 5] = [1];

    out.push(skipped);

    return out.join(",");
  }
</script>

<b>{tour()}</b>
