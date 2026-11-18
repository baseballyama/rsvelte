export class R {
	#x = $state.raw({});

	m(s) {
		this.#x = {
			a: s,
			/* } ) ; */
			b: s
		};
	}
}
