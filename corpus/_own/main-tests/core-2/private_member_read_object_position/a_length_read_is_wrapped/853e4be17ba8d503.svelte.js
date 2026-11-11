export class C {
	#x = $state([{ key: 1 }]);

	m(k) {
		if (!this.#x) return undefined;
		return this.#x.length;
	}
}