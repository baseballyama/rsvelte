<script>
	export let p = 1;
	let n = 0;
	$: doubled = n * 2;
	function f() {
		try { n = 1; } catch ($state) { n = 2; }
	}
</script>

<div>{p} {doubled} {f}</div>
