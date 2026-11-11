class S {
	v;
	#props = $derived(() => ({
		/* a
		 ) still comment
		 */
		role: "meter"
	}));
	get props() { return this.#props(); }
}
export function make(o) { return new S(o); }
