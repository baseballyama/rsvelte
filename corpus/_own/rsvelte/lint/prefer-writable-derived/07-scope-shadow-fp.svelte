<script>
	function makeInner() {
		let width = $state(0);
		return () => width;
	}
	let width = 10;
	let height = $state(0);
	$effect(() => {
		width = height * 2;
	});
	const read = makeInner();
</script>

{width}{read()}
