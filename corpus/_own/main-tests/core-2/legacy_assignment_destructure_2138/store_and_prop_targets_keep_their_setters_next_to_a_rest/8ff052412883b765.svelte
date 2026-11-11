<script>
	export let a = 1;
	let rest = {};
	const obj = { a: 1, c: 2 };
	function f() { ({ a, ...rest } = obj); }
</script>
<button onclick={f}>{a} {JSON.stringify(rest)}</button>