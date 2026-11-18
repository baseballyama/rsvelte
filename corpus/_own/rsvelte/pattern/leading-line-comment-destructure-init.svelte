<script>
	export let focusIndex = -1;
	export let sequence = { position: 0, playing: false, length: 1 };

	// A transformed prop read in the initializer used to move this comment after the pattern.
	const registerFocus = (index) => ({ idx: index, focusManager: null });
	// Focusable control with index
	const { idx, focusManager } = registerFocus(focusIndex);

	// A transformed state read in the initializer reached the same invalid output shape.
	// Bindings
	const { position, playing, length } = sequence;
</script>

<p>{idx}{focusManager}{position}{playing}{length}</p>
