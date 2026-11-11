<script>
	export let count;
	let x = 0;
	function setup() {
		$: {
			x = count;
		}
	}
	setup();
</script>

{x}
