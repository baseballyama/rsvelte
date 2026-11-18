<script module>
	let plain_a = 0, plain_b = 1;
	let y = 0, x = $state(1);
	let raw = $state.raw([1]), after_raw = 2;
	let p = $derived(x + 1), q = 5;
	let by = $derived.by(() => x), after_by = 6;
	let snap = $state.snapshot(raw), after_snap = 7;
	let { a, b } = $state({ a: 1, b: 2 }), after_pattern = 8;
</script>

<script>
	let i_y = 0, i_x = $state(1);
	let i_p = $derived(i_x + 1), i_q = 5;
</script>

<div>
	{plain_a}{plain_b}{y}{x}{raw.length}{after_raw}{p}{q}{by}{after_by}
	{snap.length}{after_snap}{a}{b}{after_pattern}{i_y}{i_x}{i_p}{i_q}
</div>
