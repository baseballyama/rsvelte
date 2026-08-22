<script>
	function top() {}
	{
		function inner() {}
		inner();
	}
	if (top) {
		function nested() {}
		nested();
	}
	top();
</script>
