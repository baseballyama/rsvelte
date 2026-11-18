<script>
	export let a = 1;
	export let rest = {};
	const obj = { a: 3, b: 4 };
	function f() { ({ a, ...rest } = obj); }
</script>
<button onclick={f}>{a} {JSON.stringify(rest)}</button>