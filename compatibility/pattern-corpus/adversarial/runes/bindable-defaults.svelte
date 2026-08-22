<script>
	let {
		value = $bindable('fallback'),
		count = $bindable(),
		config = $bindable({ nested: [1] }),
		...rest
	} = $props();
</script>

<input bind:value />
<p>{count ?? 'unset'}:{config.nested[0]}:{Object.keys(rest).length}</p>
