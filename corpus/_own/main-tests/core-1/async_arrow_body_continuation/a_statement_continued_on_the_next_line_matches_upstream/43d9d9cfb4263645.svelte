<script>
	let { a } = $props();
	const first = await Promise.resolve(1);
	let d = $derived(a);
	let s = $state(0);
	const f = async (x) =>
		await x;
</script>
<p>{first}{d}{s}</p>
