class S {
	// ) c
	opts;
	constructor(opts) { this.opts = opts; }
	#props = $derived(() => ({
		id: this.opts.id,
		role: "meter"
	}));
	get props() { return this.#props(); }
}
export function make(o) { return new S(o); }