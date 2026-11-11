<script>
	let a = $state(1);
	let d = $derived(a * 2);
	const g = () => {
		$effect.pre(() => a);
	};
	g();
</script>
<b>{a}{d}</b>
