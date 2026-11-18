export class C {
	#raw = $state.raw(null);
	#derived = $derived.by(() => 1);

	m() {
		const v = /** @type {string} */ (this.#derived);
		return v;
	}
}