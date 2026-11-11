<script>
	function preventDefault(fn) {
		return function (event) {
			event.preventDefault();
			fn.call(this, event);
		};
	}

	let scroll = $state({ x: 0 });
	let x = $state(1);
	function bump() { x += 1; }
</script>

<form onsubmit={preventDefault(() => (scroll.x = x))}></form>
<button onclick={bump}></button>
