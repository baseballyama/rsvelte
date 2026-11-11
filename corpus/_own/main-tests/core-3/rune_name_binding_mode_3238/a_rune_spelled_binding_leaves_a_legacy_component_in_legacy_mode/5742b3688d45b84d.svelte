<script>
	export let p = 1;
	let n = 0;
	$: doubled = n * 2;
	function f() { $derived: for (;;) { continue $derived; } }
</script>
<div>{p} {doubled}</div>
