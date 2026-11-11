<script>
	let { a } = $props();
	const first = await Promise.resolve(1);
	let d = $derived(a);
	let s = $state(0);
	if (a) s = 1;
	else
		s = d;
</script>
<p>{first}{d}{s}</p>
