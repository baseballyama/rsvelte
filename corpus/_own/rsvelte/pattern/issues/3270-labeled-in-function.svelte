<script>
	function pick() {
		let out = 0;
		inner: {
			let r = $state(6);
			out = r;
			break inner;
		}
		return out;
	}
</script>

<p>{pick()}</p>
