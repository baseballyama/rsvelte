<script>
	let v = foo(
		/* ) c */
		1
	);
	function go() { v = 2; }
</script>

<p on:click={go}>{v}</p>
