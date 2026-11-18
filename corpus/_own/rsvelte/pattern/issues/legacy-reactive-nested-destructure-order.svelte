<script>
	let mode
	let queries = {}
	let config = [['ready']]
	let baseQuery
	let consumer

	$: consumer = baseQuery
	$: if (mode === undefined || queries[mode] === undefined) {
		;[[mode]] = config
	}
	$: if (mode !== undefined) {
		baseQuery = queries[mode] ?? {}
	}
</script>

<p>{consumer}</p>
