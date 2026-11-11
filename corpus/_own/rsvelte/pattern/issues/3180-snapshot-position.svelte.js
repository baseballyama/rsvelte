let o = { a: 1 };

// A declarator initializer loses the wrap; the non-first one is the case a
// keyword scan walking back from the name could not see.
let single = $state.snapshot(o);
let y = 0, later = $state.snapshot(o);

class K {
	field = $state.snapshot(o);
	#priv = $state.snapshot(o);
	static stat = $state.snapshot(o);

	read() {
		return $state.snapshot(o);
	}

	assign() {
		this.other = $state.snapshot(o);
	}

	get priv() {
		return this.#priv;
	}
}

const held = { p: $state.snapshot(o) };
const ternary = o.a ? $state.snapshot(o) : o;

export function read() {
	const k = new K();
	return [single, y, later, k.field, k.priv, K.stat, k.read(), held.p, ternary];
}
