<script>
	function outer($inspect) {
		return $inspect;
	}
	const arrow = ($inspect = 1) => $inspect;
	function rest(...$inspect) {
		return $inspect;
	}
	try {
		void 0;
	} catch ($inspect) {
		void $inspect;
	}
	void [outer, arrow, rest];
</script>
<p>parameters</p>
