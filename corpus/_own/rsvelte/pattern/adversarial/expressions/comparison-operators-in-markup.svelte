<script>
  let a = $state(1);
  let b = $state(2);
  const list = [1, 2, 3];
</script>

<b>{a < b}</b>
<b>{a > b}</b>
<b>{a <= b}</b>
<b>{a >= b}</b>
<b>{a < b ? "<" : ">"}</b>
<b>{list.filter((n) => n < 2).length}</b>
<b>{list.map((n) => (n > 1 ? "<b>" : "</b>")).join("")}</b>
<div title={a < b ? "lt" : "gt"}>a</div>
<div data-a={a > b}>b</div>
{#if a < b}
  <b>c</b>
{/if}
{#each list.filter((n) => n < 3) as n}
  <b>{n}</b>
{/each}
<b>1 &lt; 2 and 3 &gt; 2</b>
