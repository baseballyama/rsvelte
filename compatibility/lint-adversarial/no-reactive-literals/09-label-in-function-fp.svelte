<script>
	export let count;
	let a;
	function setup() {
		$: a = 'nested';
	}
	setup();
	$: void count;
</script>

{a}
