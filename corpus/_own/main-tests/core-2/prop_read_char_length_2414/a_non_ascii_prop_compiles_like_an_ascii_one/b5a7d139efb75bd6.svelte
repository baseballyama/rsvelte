<script>
	export let ab = 0;
	let out;
	$: out = (x) => x + ab;
</script>
<p>{out}</p>