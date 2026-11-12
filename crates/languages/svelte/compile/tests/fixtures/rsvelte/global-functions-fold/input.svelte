<script>
	let n = $state(1);
	const a = Number.parseInt(" -0x1f");
	const b = Number.parseInt("z", 36);
	const c = Number.parseFloat("1e3x");
	const d = String.fromCharCode(72, 105);
	const e = String.fromCodePoint(0x1f600);
	const f = Math.f16round(1.337);
	const g = Math.round(-0.4);
	const h = Math.pow(1, "x");
	const i = Math.max(...[1, n]);
</script>

<p>{a} {b} {c} {d} {e} {f} {g} {h} {i}</p>
<p>{1 ** Infinity}</p>
