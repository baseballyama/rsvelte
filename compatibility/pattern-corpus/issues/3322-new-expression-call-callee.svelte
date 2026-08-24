<script>
	class C {}

	function getC() {
		return C;
	}

	void getC;
</script>

{new (getC())()}
