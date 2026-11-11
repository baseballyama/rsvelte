<script>
	let z = 1; $: r = z + 1;
	export let c = r ?? null;
</script>
<p>{c}</p>
