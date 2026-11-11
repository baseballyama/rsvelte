<script>
	export let p = 1;
	let n = 0;
	$: doubled = n * 2;
	function f() {
		try { n = 1; } catch ($effect) { n = 2; }
	}
</script>

<div>{p} {doubled} {f}</div>
