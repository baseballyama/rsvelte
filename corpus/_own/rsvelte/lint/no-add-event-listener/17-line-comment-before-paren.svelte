<script>
	let el;

	function lineComment() {
		el.addEventListener // between the callee and its argument list
			('a', () => {});
	}

	function blockComment() {
		el.addEventListener /* between the callee and its argument list */ ('b', () => {});
	}
</script>

<div bind:this={el}></div>
<button onclick={lineComment}>a</button>
<button onclick={blockComment}>b</button>
