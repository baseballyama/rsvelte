<script>
	const src = "el.addEventListener('a', f)";
	const re = /addEventListener/g;
	// addEventListener in a line comment
	/* addEventListener in a block comment */
	const tpl = `${src} addEventListener`;
	let el;

	function go() {
		/* addEventListener */ el.addEventListener('a', () => {});
		el . addEventListener ( 'b' , () => {} );
	}
</script>

<!-- addEventListener in an HTML comment -->
<div bind:this={el} data-x="addEventListener">{src}{re}{tpl}</div>
<button onclick={go}>go</button>
