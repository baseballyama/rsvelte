<script>
	export let p = 1;
	let n = 0;
	$: doubled = n * 2;
	function f() { try {} catch ($state) { return $state; } }
</script>
<div>{p} {doubled}</div>
