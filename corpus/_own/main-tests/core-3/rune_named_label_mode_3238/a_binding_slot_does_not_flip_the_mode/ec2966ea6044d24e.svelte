<script>
	export let p = 1;
	let n = 0;
	$: doubled = n * 2;
	function f() {
		$state: for (;;) { break $state; }
	}
</script>

<div>{p} {doubled} {f}</div>
