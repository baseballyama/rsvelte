<script>
	let a = $state(1);
	let b = $state(2);
	const obj = { fn: (x) => x, nested: { deep: [1, 2] } };
	const tag = (strings, ...vals) => strings.raw.join('|') + vals.join(',');
</script>

<p>{a + b * 2 ** 3 - -a}</p>
<p>{(a ?? b) || (a && b)}</p>
<p>{a > b ? (a < b ? 'x' : 'y') : 'z'}</p>
<p>{obj.nested?.deep?.[a] ?? 'none'}</p>
<p>{obj.fn?.(a)}</p>
<p>{tag`raw ${a} and ${b}`}</p>
<p>{`nested ${`inner ${a}`} done`}</p>
<p>{[...obj.nested.deep, a].join('/')}</p>
<p>{{ ...obj.nested, extra: a }.extra}</p>
<p>{(() => { const c = a + b; return c; })()}</p>
<p>{typeof a === 'number' ? void 0 ?? 'num' : 'other'}</p>
<p>{(a, b)}</p>
<p>{a < b === true}</p>
<p>{~a | (b & 3) ^ 1}</p>
<p>{(a >>> 1) + (b << 1)}</p>
