<script>
	export let a = 1;
	export let b = 2;
	const obj = { a: 3, b: 4 };
	function f() { ({ a, b } = obj); }
</script>
<button onclick={f}>{a} {b}</button>