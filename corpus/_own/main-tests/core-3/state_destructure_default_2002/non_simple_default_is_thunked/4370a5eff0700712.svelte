<script>
	let o = {};
	let { a, b = o.x } = $state({});
</script>
<p>{a}{b}</p>