<script>
	function $inspect(v) {
		return v;
	}
	const value = $inspect(1);
	void value;
</script>
<p>a local function named $inspect is still reported</p>
