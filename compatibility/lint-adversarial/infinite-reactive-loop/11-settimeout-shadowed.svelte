<script>
	let x = 0;
	function setTimeout(fn) {
		fn();
	}
	$: setTimeout(() => {
		x = x + 1;
	});
</script>

{x}
