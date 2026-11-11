<script>
	let o = { f: (x) => x[0] };
	function ltag(x) { return x[0]; }
</script>
<input pattern={o.f`a`} />
