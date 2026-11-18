<script>
	const a = 1;
	export { a as b };
	function f() { a = 2; }
</script>
<button onclick={f}>{a}</button>