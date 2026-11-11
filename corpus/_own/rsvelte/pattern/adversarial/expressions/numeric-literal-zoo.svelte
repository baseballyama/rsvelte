<script>
	const dec = 1_000_000;
	const hex = 0xff_ff;
	const oct = 0o7_7;
	const bin = 0b1010_1010;
	const big = 9_007_199_254_740_993n;
	const lead = .5;
	const trail = 5.;
	const exp = 1.5e-10;
	const neg = -0;
	let total = $state(0);

	function sum() {
		total = dec + hex + oct + bin + lead + trail + exp + neg + Number(big % 2n);
	}
</script>

<button onclick={sum}>{total}{String(big)}</button>
