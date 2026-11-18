<script>
	export let p = 1;
	let n = 0;
	$: doubled = n * 2;
	function f() { let $effect = 1; $effect += 1; return $effect; }
</script>
<div>{p} {doubled}</div>
