<script>
	let a = $state(1);
	let d = $derived(a * 2);
	const g = () => {
		$inspect(a);
	};
	g();
</script>
<b>{a}{d}</b>
