<script>
	let n = $state(1);
	let k = $state('a');
	let [x, [y, { z }]] = $state([1, [2, { z: 3 }]]);
	let { a: [b = n], [k]: c, ...rest } = $state({ a: [], b: 4 });
	let { m, ...s } = $state.raw({ m: 5, o: 6 });
	let {} = $state({});
</script>

<button onclick={() => { y++; b++; rest = {}; s = {}; }}>
	{x}{y}{z}{b}{c}{Object.keys(rest).length}{m}{Object.keys(s).length}
</button>
