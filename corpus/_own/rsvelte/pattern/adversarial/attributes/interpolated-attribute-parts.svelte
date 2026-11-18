<script>
  let a = $state("a");
  let b = $state("b");
</script>

<div title={a}>1</div>
<div title="{a}{b}">2</div>
<div title="x{a}y{b}z">3</div>
<div title="{a} {b}">4</div>
<div title=" {a} ">5</div>
<div title="{a}-">6</div>
<div title="-{a}">7</div>
<div title={`${a}${b}`}>8</div>
<div title={a ?? "d"}>9</div>
<div data-x={a} data-y={b}>10</div>
