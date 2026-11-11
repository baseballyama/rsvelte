export class R {
	#x = $state.raw({});

	constructor(s) {
		this.#x = {
			a: s,
			/* } ) ; */
			b: s
		};
	}
}
