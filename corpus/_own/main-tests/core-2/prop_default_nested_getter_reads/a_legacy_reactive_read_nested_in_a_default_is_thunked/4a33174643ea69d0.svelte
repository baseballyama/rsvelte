<script>
	let z = 1; $: r = z + 1;
	export let c = 1 ? (r ?? 2) : 3;
</script>
<p>{c}</p>
