<script>
	export let p = 1;
	let n = 0;
	$: doubled = n * 2;
	function f() { function $inspect() { return 1; } return $inspect(); }
</script>
<div>{p} {doubled}</div>
