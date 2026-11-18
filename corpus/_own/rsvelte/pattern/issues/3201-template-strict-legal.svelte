<script>
	let count = 0;
	const evaluate = (x) => x;
</script>

<b>{0o755}</b>
<b>{0x1f}</b>
<b>{1_000}</b>
<b>{'a\\251'}</b>
<b>{eval('1')}</b>
<b>{({ __proto__: count })}</b>
<b>{({ static: 1, let: 2, private: 3 }).static}</b>
<b>{evaluate(count)}</b>
