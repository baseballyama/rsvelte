<script>
	let { "a\u0041b": v, ...r } = $state({});
</script>
<p>{v}{r}</p>