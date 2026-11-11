<script>
	export let p = 1;
	let n = 0;
	$: doubled = n * 2;
	function f($p = $state(0)) { return $p; }
</script>
<div>{p} {doubled}</div>
