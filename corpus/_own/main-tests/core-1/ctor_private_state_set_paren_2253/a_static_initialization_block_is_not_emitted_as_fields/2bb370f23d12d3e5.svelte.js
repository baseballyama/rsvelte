export class R {
	#x = $state.raw({});

	static { const s = 1;
		this.#x = {
			a: s,
			// } ) ; c
			b: s
		};
	}
}
