<script>
	export let a = 1;
	function f() { a = 2; }
</script>
<button onclick={f}>{a}</button>