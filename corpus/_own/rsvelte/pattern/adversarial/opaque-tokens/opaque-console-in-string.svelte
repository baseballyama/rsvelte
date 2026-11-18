<script>
	let n = $state({ v: 1 });
	const hint = 'call console.log(n) to inspect';
	const tpl = `console.error(${'x'})`;

	function report() {
		console.log(n, hint, tpl);
	}
</script>

<button onclick={report}>{hint.length}</button>
