<script>
	let v = $state('x');
	let cls = $state({ a: true, b: false });
	const style = $derived(`--w:${v.length}`);
</script>

<div
	class={['a', cls.a && 'b', { c: cls.b }]}
	style={style}
	style:color="red"
	style:--custom={v}
	style:width|important="1px"
	data-empty=""
	data-quoted='single'
	data-mixed="a{v}b"
	data-only={v}
	hidden={v === ''}
	tabindex={-1}
	aria-hidden={!v}
></div>
<input value={v} readonly={v.length > 0} required={0} disabled={NaN} />
<img src="a.png" alt="" srcset="a.png 1x, b.png 2x" sizes="(min-width: 1px) 1px" />
<button onclick={() => (v += '!')}>{v}</button>
