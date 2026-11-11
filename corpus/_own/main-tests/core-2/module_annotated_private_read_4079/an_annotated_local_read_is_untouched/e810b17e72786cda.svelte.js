export class C {
	#raw = $state.raw(null);
	#derived = $derived.by(() => 1);

	m() {
		const local = 1;
		return /** @type {string} */ (local);
	}
}