<script>
	let n = $state(1);
	let m = $state(2);
	let a = 1;
	let b = 2;
	function f() { return 1; }
	function bump() { m = 3; }
	$effect(() => {
		console.log(m);
	});
</script>
<b onclick={bump}>x</b>
