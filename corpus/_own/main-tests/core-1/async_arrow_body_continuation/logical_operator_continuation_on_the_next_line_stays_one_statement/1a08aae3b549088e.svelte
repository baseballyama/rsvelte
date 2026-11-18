<script>
	let { a } = $props();
	const first = await Promise.resolve(1);
	let d = $derived(a);
	const both = a ||
		d;
</script>
<p>{both}{first}</p>
