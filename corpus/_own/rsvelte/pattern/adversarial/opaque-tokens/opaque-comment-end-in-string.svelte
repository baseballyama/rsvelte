<script>
	let x = $state(1);
	const closer = '*/ not a comment end';
	/* real comment mentioning ${holes} and => arrows */
	const opener = 'text with /* inside';

	function move() {
		/* before */ x++; /* after ++ */
		x--; // trailing about --
	}
</script>

<button onclick={move}>{x}:{closer.length}:{opener.length}</button>
