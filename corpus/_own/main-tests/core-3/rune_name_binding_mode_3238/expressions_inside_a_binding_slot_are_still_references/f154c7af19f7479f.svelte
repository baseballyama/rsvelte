<script>
	export let p = 1;
	let n = 0;
	$: doubled = n * 2;
	function f() { const v = $state(0); return v; }
</script>
<div>{p} {doubled}</div>
