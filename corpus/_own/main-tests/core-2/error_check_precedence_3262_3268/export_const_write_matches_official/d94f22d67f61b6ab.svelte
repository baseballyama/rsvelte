<script>
	export class a {}
	function f() { a = 2; }
</script>
<button onclick={f}>{a}</button>