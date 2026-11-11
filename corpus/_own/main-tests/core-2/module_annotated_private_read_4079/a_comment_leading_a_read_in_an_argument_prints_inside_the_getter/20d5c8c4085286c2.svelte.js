export class C {
	#raw = $state.raw(null);
	#derived = $derived.by(() => 1);

	m() {
		return String(/** @type {string} */ (this.#raw));
	}
}