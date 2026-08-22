<script>
  let n = $state(1);
  const table = { key: "k" };
</script>

<div title={`plain ${n}`}>a</div>
<div title={`nested ${`inner ${n}`} outer`}>b</div>
<div title={`braces ${JSON.stringify({ a: n })} end`}>c</div>
<div title={`quote " and ' inside`}>d</div>
<div title={`backtick \` escaped`}>e</div>
<div title={`${table[`${"k" + "ey"}`]}`}>f</div>
<div data-a={`${n}`} data-b={`a${n}b`} data-c={`${n}${n}`}>g</div>
<div style:color={`rgb(${n}, 0, 0)`}>h</div>
