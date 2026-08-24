<script>
	let m = 0;
	let out = 0;
	$: out = { a: m }.a;
</script>

<p>{out}</p>
<button onclick={() => m++}>b</button>
