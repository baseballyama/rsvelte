class S {
	v;
	#props = $derived(() => ({
		id: ")",
		role: "meter"
	}));
	get props() { return this.#props(); }
}
export function make(o) { return new S(o); }
