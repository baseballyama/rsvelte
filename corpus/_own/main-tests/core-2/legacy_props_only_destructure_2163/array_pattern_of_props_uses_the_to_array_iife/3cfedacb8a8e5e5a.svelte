<script>
	export let a = 1;
	export let b = 2;
	const arr = [3, 4];
	function f() { [a, b] = arr; }
</script>
<button onclick={f}>{a} {b}</button>