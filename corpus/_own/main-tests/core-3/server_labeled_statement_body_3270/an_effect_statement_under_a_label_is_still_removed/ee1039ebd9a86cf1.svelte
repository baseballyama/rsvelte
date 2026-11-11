<script>
	let n = $state(1);
	outer: {
		$effect(() => {
			console.log(n);
		});
		break outer;
	}
</script>

<p>{n}</p>
