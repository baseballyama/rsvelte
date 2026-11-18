<script>
	export let 名前 = 0;
	let out;
	$: out = 名前 + 1;
</script>
<p>{out}</p>