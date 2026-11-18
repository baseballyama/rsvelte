<script>
	let count = $state(0);

	function tooltip(node) {
		node.title = 'hi';
		return () => {
			node.title = '';
		};
	}

	function color(c) {
		return (node) => {
			node.style.color = c;
		};
	}
</script>

<div {@attach tooltip}>static</div>
<p {@attach color(count > 0 ? 'red' : 'blue')}>{count}</p>
<button {@attach (node) => node.focus()} onclick={() => count++}>add</button>
<span {@attach tooltip} {@attach color('green')}></span>
