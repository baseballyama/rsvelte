<script>
	let a = $state(1);
	let d = $derived(a * 2);
	const g = () => {
		$inspect(d);
	};
	g();
</script>
<b>{a}{d}</b>
