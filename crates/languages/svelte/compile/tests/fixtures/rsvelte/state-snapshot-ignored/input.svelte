<script>
	let value = $state({ f: () => {} });
	// svelte-ignore state_snapshot_uncloneable
	const copy = $state.snapshot(value);
</script>

<p>{copy.f}</p>
