<script>
	export let count;
	$: function decl() {
		return count;
	}
	if (count) {
		function nested() {}
		nested();
	}
	function top() {}
	top();
	void decl;
</script>

{count}
