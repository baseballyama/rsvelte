<script>
	export let start;
	let total = 0;
	$: total += 1;
	$: void start;
</script>

{total}
