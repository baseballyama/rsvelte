<script>
	let n = $state(1);
	const abs = $derived(Math.abs(n));
	const sign = $derived(Math.sign(n));
	const str = $derived(String(n));
	const num = $derived(Number(n));
	const chained = $derived(Math.max(Math.abs(n), 2) || 0);
	const impure = $derived(parseInt(n));
	const untabled = $derived(Math.hypot(n, 2));
</script>

<b>{abs}</b>
<b>{sign}</b>
<b>{str}</b>
<b>{num}</b>
<b>{chained}</b>
<b>{impure}</b>
<b>{untabled}</b>
