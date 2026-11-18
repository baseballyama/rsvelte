export class R {
	#x = $state.raw({});

	constructor(s) {
		this.#x = {
			a: s,
			// c
			b: s
		};
	}

	m(s) {
		this.#x = {
			a: s,
			// c
			b: s
		};
	}
}
