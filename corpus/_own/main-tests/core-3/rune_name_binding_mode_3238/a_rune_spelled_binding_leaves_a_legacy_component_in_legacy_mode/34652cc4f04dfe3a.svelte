<script>
	export let p = 1;
	let n = 0;
	$: doubled = n * 2;
	function f() { const { $state, $derived: $host } = window; return [$state, $host]; }
</script>
<div>{p} {doubled}</div>
