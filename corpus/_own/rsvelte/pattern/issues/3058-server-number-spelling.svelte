<script>
	const tiny = $derived(1e-7);
	const huge = $derived(1e21);
	const negzero = $derived(-0);
	const frac = $derived(.5 + 5.);
	const safe = $derived(Number.MAX_SAFE_INTEGER);
	const bin = $derived(0b1010 + 0o17 + 0xff);
	const big = $derived(2_000n === 2_000n ? 1n : 0n);
</script>

<p>{tiny} {huge} {Object.is(negzero, -0)} {frac} {safe} {bin} {big}</p>
