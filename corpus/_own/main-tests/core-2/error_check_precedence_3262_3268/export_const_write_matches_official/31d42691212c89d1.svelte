<script>
	export const a = 1;
	let n = $state(1);
	function f() { a = 2; }
</script>
<button onclick={f}>{a}</button>