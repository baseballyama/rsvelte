<script>
	let base = $state(2);
	let out = 0;
	if (base > 1) {
		let d = $derived(base * 3);
		out = d;
	}
</script>

<p>{out}</p>
