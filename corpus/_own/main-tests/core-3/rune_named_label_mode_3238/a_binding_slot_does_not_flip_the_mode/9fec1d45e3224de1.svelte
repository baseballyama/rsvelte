<script>
	export let p = 1;
	let n = 0;
	$: doubled = n * 2;
	function f() {
		$props: while (0) { break $props; }
	}
</script>

<div>{p} {doubled} {f}</div>
