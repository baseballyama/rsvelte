<script>
	let b = 2;
	const props = { 'data-y': `w${b}` };
	const cls = `c${b}`;
</script>

<div {...props} data-x={`v${b}`}>1</div>
<div class={cls} {cls}>2</div>
