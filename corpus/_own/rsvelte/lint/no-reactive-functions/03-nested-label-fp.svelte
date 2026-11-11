<script>
	export let count;
	let handler;
	function setup() {
		$: handler = () => count;
	}
	setup();
</script>

{handler}
