<script>
	let value = 'q';
</script>

<container><span class="in"></span></container>
<section class="host"></section>
<div class={`opaque ${value}`}></div>
<div class="spread" {...{ role: 'note' }}></div>

<style>
	/* The `<div>`s can carry any class at runtime; a `<container>` and a
	   `<section>` cannot become one, so these must still be reported even
	   though the component holds an element with an unresolvable `class`. */
	container {
		&.dragging { color: red }
	}
	section {
		&.dragging { color: red }
	}
	.host {
		&.dragging { color: red }
	}

	/* Controls: the same shape anchored where an element CAN satisfy the whole
	   compound, so a fix that stopped consulting the flag and pruned everything
	   would break them. */
	div {
		&.dragging { color: red }
	}
	.spread {
		&.dragging { color: red }
	}
	.host {
		&.host { color: red }
	}
	container {
		&:hover { color: red }
	}
</style>
