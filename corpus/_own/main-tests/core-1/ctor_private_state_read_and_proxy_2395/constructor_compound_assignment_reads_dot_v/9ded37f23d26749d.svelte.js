export class R {
	#x = $state.raw({});
	#n = $state(0);
	#d = $derived(this.#n * 2);

	constructor(s) {
		this.#x ??= { a: s };
		this.#n ??= { a: s };
		this.#d ??= s;
		this.#x += 1;
		this.#n += 1;
		this.#n <<= 2;
	}

	m(s) {
		this.#x ??= { a: s };
		this.#n ??= { a: s };
		this.#x += 1;
		this.#n += 1;
		this.#n <<= 2;
	}
}
