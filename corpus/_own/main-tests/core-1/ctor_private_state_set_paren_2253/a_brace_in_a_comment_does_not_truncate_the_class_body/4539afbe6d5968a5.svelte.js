export class R {
	#x = $state.raw({});

	m(s) {
		this.#x = {
			a: s,
			// } ) ; c
			b: s
		};
	}

	last() {
		return 42;
	}
}
