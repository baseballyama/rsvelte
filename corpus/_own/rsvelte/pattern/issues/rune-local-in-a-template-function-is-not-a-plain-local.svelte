<script>
	let prop = $state({ n: 1 });
	function use(a) {
		return a;
	}
</script>

<!--
  The runes are read from a CLOSURE on purpose. Upstream's `state_referenced_locally`
  walk stops at a function boundary, so a bare `use(counter + raw)` here would make
  this file assert a warning class the template path does not reach: phase 2's
  Identifier visitor never enters a template expression's function body, so the two
  warnings official emits for that read have no counterpart. The lowering this file
  exists for is the WRITE, and the closure keeps it.
-->
<button
	onclick={() => {
		let counter = $state(1);
		let raw = $state.raw(1);
		counter = 2;
		raw = 3;
		use(() => counter + raw);
	}}
>a</button>

<button
	onclick={() => {
		let local = 1;
		local = 2;
		prop.n = local;
	}}
>b</button>

{prop.n}
