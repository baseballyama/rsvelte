<script>
	const value = $derived((async function () { return await Promise.resolve(1); })());
</script>

<p>{value}</p>
