class S {
	opts;
	constructor(opts) { this.opts = opts; }
	#props = $derived(() => ({
		id: this.opts.id,
	// ; c
		role: "meter"
	}));
	get props() { return this.#props(); }
}
export function make(o) { return new S(o); }