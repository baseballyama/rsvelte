let o = 1;

function compute() {
	return o;
}

class Gate {
	pending = $effect.pending();
	eager = $state.eager(o);
	// A zero-argument call of an identifier loses the arrow the thunk adds.
	unthunked = $state.eager(compute());
	static both = $effect.pending();
}

const holder = {
	p: $effect.pending(),
	e: $state.eager(o),
	f: $state.eager(compute()),
};

export function read() {
	const gate = new Gate();
	return [gate.pending, gate.eager, gate.unthunked, Gate.both, holder.p, holder.e, holder.f];
}
