export class R {
	#x = $state.raw({});

	m(s) {
		this.#x = {
			f: () => { g(); },
			b: s
		};
	}
}
