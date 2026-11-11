<script>
	export let count;
	function doStuff(c) {
		return c;
	}
	$: {
		inner: doStuff(count);
	}
</script>

{count}
