<script>
	let a = $state(1);
	let b = $state(2);
	const tag = (strings, ...vals) => strings.raw.join('|') + vals.join(',');
	const big = 9_007_199_254_740_993n;
	const bin = 0b1010_1010;
	const oct = 0o777;
	const hexFloat = 0x1f + 0.5;
	const tiny = 1e-7;
	const half = 0.5;
</script>

<p>{(a, b)}</p>
<p>{tag`x${a}y${b}z`}</p>
<p>{String.raw`\n${a}\t`}</p>
<p>{typeof big}:{bin}:{oct}:{hexFloat}:{tiny}:{half}</p>
<p>{a ** b ** 2}</p>
<p>{-(a ** 2)}</p>
<p>{a in { 1: true } ? 'in' : 'out'}</p>
<button onclick={() => (a++, b--, void 0)}>seq</button>
