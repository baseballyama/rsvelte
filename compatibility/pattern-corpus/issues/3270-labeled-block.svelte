<script>
	let out = 0;
	outer: {
		let r = $state(5);
		out = r;
		break outer;
	}
</script>

<p>{out}</p>
