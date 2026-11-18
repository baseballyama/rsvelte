<script>
	export let 名前 = 0;
	let out;
	$: out = (x) => x + 名前;
</script>
<p>{out}</p>