<script>
	let n = 1;
	let s = 'a';
	let o = { p: true };
</script>

<div class={n === 1 ? '' : 'neq'}>1</div>
<div class={!o.p ? 'off' : ''}>2</div>
<div class={n > 1 ? '' : 'le'}>3</div>
<div class={typeof s === 'string' ? '' : 'not-str'}>4</div>
