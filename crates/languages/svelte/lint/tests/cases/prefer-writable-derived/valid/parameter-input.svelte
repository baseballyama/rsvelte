<script>
	function f(b) {
		$effect(() => {
			b = 1;
		});
	}
	let c = $state.raw(0);
	$effect(() => {
		c = 1;
	});
	$effect(() => {
		d = 1;
	});
</script>
{f}{c}