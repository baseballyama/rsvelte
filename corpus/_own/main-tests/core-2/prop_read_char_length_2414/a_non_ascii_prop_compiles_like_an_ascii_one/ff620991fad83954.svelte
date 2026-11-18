<script>
	export let ab = 0;
	let out;
	$: out = ab + 1;
</script>
<p>{out}</p>