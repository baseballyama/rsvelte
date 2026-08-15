/* Initialize shared state. */
const state = { count: 0 };

// Update the state before exporting it.
function increment(step = 1) {
	state.count += step;
	return state.count;
}

/** Public counter API. */
export { increment, state };
