<script>
	let v = $state(0);
	let src = $state(0);
	function setup() {
		$effect(() => {
			v = src * 3;
		});
	}
	setup();
</script>

{v}
