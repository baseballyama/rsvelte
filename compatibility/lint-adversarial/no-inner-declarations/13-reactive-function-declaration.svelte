<script>
	export let count;
	$: {
		function decl() {
			return count;
		}
		void decl;
	}
	if (count) {
		function nested() {}
		nested();
	}
	function top() {}
	top();
</script>

{count}
