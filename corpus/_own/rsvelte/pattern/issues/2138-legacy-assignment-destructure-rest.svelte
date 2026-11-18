<script>
	const k = 'd';
	let a = 1;
	let w = 0;
	let d = 0;
	let r = {};
	const obj = { a: 1 };

	function f() {
		({ a, 'weird-name': w, [k]: d, ...r } = obj);
	}
</script>

<button onclick={f}>{a}{w}{d}{Object.keys(r).length}</button>
