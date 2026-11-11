<script>
	let { a } = $props();
	const first = await Promise.resolve(1);
	let d = $derived(a);
	const f = (x) =>
		d && x;
	const g = (id) => id;
</script>
<p>{f(first)}{g(1)}</p>
