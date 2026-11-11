<script>
	let items = [
		/* ) c */
		1
	];
	function go() { items = [2]; }
</script>

<p on:click={go}>{items[0]}</p>
