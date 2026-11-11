<script>
	export let p = 1;
	let n = 0;
	$: doubled = n * 2;
	function f() {
		n = 1;
	}
</script>

<div>{p} {doubled} {f}</div>
