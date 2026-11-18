<script>
	let { a } = $props();
	const first = await Promise.resolve(1);
	let d = $derived(a);
	let s = $state(0);
	const p = typeof
		d;
</script>
<p>{first}{d}{s}</p>
