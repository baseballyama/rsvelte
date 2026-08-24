<script>
	export let a = 1;
	let out = 0;
	$:
		out = a + 1; // note
	void out;
</script>

<p>{out}</p>
