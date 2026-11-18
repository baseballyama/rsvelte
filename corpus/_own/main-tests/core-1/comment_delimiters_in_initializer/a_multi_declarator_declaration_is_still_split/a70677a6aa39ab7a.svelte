<script>
	let a = 1, b = 2;
	function go() { a = 3; b = 4; }
</script>

<p on:click={go}>{a}{b}</p>
