<script>
  let n = $state(1);
  let o = $state({ id: 1 });
  const list = [1, 2];
</script>

{#key n}
  <b>a</b>
{/key}

{#key o.id}
  <b>b</b>
{/key}

{#key `${n}-${o.id}`}
  <b>c</b>
{/key}

{#key list[n - 1]}
  <b>d</b>
{/key}

{#key n > 0 ? n : -n}
  <b>e</b>
{/key}

{#key [n, o.id]}
  <b>f</b>
{/key}

{#key undefined}
  <b>g</b>
{/key}
