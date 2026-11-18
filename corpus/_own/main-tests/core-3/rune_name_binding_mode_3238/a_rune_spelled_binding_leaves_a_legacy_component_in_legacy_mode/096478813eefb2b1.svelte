<script>
	export let p = 1;
	let n = 0;
	$: doubled = n * 2;
	function f() { const $props = 1; return $props; }
</script>
<div>{p} {doubled}</div>
