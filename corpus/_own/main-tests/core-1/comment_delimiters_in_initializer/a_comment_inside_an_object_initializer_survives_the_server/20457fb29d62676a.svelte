<script>
	let data = {
		/* c */
		a: 1
	};
	function go() { data = { a: 2 }; }
</script>

<p on:click={go}>{data.a}</p>
