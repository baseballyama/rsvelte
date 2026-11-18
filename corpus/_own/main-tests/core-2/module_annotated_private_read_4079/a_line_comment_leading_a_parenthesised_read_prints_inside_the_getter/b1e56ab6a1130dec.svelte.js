export class C {
	#raw = $state.raw(null);
	#derived = $derived.by(() => 1);

	m() {
		return (
			// why this is a string
			this.#raw
		);
	}
}