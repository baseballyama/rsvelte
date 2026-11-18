<script>
	export let p = 1;
	let n = 0;
	$: doubled = n * 2;
	function f() { const { [$state(0)]: v } = {}; return v; }
</script>
<div>{p} {doubled}</div>
