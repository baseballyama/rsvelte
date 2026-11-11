<script>
	export let ab = 0;
	let out;
	$: out = [ab, ab];
</script>
<p>{out}</p>