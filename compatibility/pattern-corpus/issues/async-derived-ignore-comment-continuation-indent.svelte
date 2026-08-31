<script>
	let { p, q } = $props();

	// svelte-ignore await_waterfall
	const single = $derived(await p);

	// The two-declarator neighbour, which takes the other hoist path and was
	// already correct: it bounds the fix rather than reproducing the defect.
	// svelte-ignore await_waterfall
	const first = $derived(await q), second = $derived(await p);
</script>

<p>{typeof single}{typeof first}{typeof second}</p>
