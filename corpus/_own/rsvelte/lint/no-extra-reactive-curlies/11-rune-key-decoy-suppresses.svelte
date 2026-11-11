<script>
	export let count;
	let total;
	const holder = { $state: 1 };
	$: {
		total = count * 2;
	}
	void holder;
</script>

{total}
