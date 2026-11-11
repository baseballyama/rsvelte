<script>
	export let a = 1;
	let s = 0;
	const obj = { a: 3, s: 4 };
	function f() { ({ a, s } = obj); }
</script>
<button onclick={f}>{a} {s}</button>