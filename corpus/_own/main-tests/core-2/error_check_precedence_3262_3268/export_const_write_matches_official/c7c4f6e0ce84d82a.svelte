<script>
	export function a() {}
	function f() { a = 2; }
</script>
<button onclick={f}>{a}</button>