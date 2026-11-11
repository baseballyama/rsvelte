<script>
  let rows = $state([{ id: 1 }]);
  let n = $state(0);
  const table = { key: "a" };
</script>

{#key n}
  <b>a</b>
{/key}

{#key `${n}-${table.key}`}
  <b>b</b>
{/key}

{#key rows.map((row) => row.id).join()}
  <b>c</b>
{/key}

{#key n > 0 ? "high" : "low"}
  <b>d</b>
{/key}

{#key { n }}
  <b>e</b>
{/key}

{#key [n, table.key]}
  <b>f</b>
{/key}

{#key (n, table.key)}
  <b>g</b>
{/key}

{#key n}
  {#key table.key}
    <b>h</b>
  {/key}
{/key}
