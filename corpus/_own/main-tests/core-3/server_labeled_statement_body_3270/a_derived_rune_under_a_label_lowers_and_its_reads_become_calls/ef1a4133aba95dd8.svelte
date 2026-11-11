<script>
	let out = 0;
	outer: {
		let n = $state(2);
		let d = $derived(n * 3);
		out = d;
		break outer;
	}
</script>

<p>{out}</p>
