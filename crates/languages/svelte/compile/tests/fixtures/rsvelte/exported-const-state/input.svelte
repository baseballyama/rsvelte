<script>
	export const o = $state({a: 1});
	export const r = $state.raw([1]);
	function f() { o.a++; }
</script>
<button onclick={f}>{o.a}{r.length}</button>
