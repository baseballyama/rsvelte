<script>
	let mid_semi = a + // ; c
		b;

	let mid_paren = c + // ) c
		d;

	let mid_brace = e + // } c
		f;

	function go() {
		mid_semi = 1;
		mid_paren = 2;
		mid_brace = 3;
	}
</script>

<p on:click={go}>{mid_semi}{mid_paren}{mid_brace}</p>
